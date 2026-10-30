import { AsyncResource } from "node:async_hooks";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Core } from "@strapi/strapi";
import {
  BLUR_FILE_FIELDS,
  BLUR_MIME_TYPES,
  type BlurFile,
  createBlurDataURL,
  getBlurFingerprint,
  getBlurSourceURL,
  needsBlur,
  withBlur,
} from "./blur";

const FILE_UID = "plugin::upload.file";
const FETCH_TIMEOUT_MS = 15_000;
// Sources are thumbnails (~10 KB); only small images without formats are read in full
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
// The backfill starts after the server is up and pauses between files to stay gentle on S3
const BACKFILL_DELAY_MS = 10_000;
const BACKFILL_PAUSE_MS = 100;
const BACKFILL_PAGE_SIZE = 100;

type Result = "created" | "skipped" | "failed";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * The file's URLs, signed when the bucket is private, the stored ones otherwise.
 */
export function signFileUrls(
  strapi: Core.Strapi,
  file: Pick<BlurFile, "url" | "formats" | "provider">,
): Promise<Pick<BlurFile, "url" | "formats">> {
  return strapi
    .plugin("upload")
    .service("file")
    .signFileUrls({ url: file.url, formats: file.formats, provider: file.provider });
}

/**
 * The bytes of an uploaded image (a URL from signFileUrls). Also used by theme-palette.ts.
 */
export async function loadImage(strapi: Core.Strapi, url: string): Promise<Buffer> {
  // Local provider: "/uploads/<file>" in the public folder
  if (url.startsWith("/")) return readFile(path.join(strapi.dirs.static.public, url));

  // Without the query string: a signed URL must not end up in the logs
  const name = url.split("?")[0];
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${name}`);
  if (Number(res.headers.get("content-length")) > MAX_SOURCE_BYTES) {
    throw new Error(`${name} is too large to process`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Stores a blur placeholder on every uploaded or replaced image (see utils/blur.ts), and backfills
 * images that don't have one yet. Runs in the background: never blocks or fails an upload or startup.
 */
export function registerBlurPlaceholders(strapi: Core.Strapi) {
  const files = () => strapi.db.query(FILE_UID);
  const findFile = (id: number): Promise<BlurFile | null> =>
    files().findOne({ where: { id }, select: BLUR_FILE_FIELDS });

  async function processFile(id: number): Promise<Result> {
    try {
      const file = await findFile(id);
      if (!file || !needsBlur(file)) return "skipped";

      const { url, formats } = await signFileUrls(strapi, file);
      const blurDataURL = await createBlurDataURL(
        await loadImage(strapi, getBlurSourceURL({ url, formats })),
      );

      // Re-read right before writing: merge into the current metadata, and drop the placeholder if
      // the file was replaced meanwhile (the replacement queued its own job)
      const latest = await findFile(id);
      const fingerprint = getBlurFingerprint(file);
      if (!latest || getBlurFingerprint(latest) !== fingerprint || !needsBlur(latest)) {
        return "skipped";
      }

      // Triggers afterUpdate again, which skips the file: its placeholder is now up to date
      await files().update({
        where: { id },
        data: { provider_metadata: withBlur(latest.provider_metadata, blurDataURL, fingerprint) },
      });
      return "created";
    } catch (error) {
      strapi.log.warn(`Blur placeholder for file ${id} failed: ${errorMessage(error)}`);
      return "failed";
    }
  }

  // One job at a time, uploads and backfill alike. Bound here so jobs never run in the async context
  // of the request (or DB transaction) whose lifecycle event queued them.
  let queue: Promise<unknown> = Promise.resolve();
  const enqueue = AsyncResource.bind((id: number): Promise<Result> => {
    const job = queue.then(() => processFile(id));
    queue = job;
    return job;
  });

  // Lifecycle handlers must never throw (that would fail the upload) nor wait for the job
  const onFileWritten = (event: { result?: unknown }) => {
    try {
      const file = event.result as BlurFile | undefined;
      if (file?.id && needsBlur(file)) void enqueue(file.id);
    } catch (error) {
      strapi.log.error(`Blur placeholder could not be queued: ${errorMessage(error)}`);
    }
  };

  strapi.db.lifecycles.subscribe({
    models: [FILE_UID],
    afterCreate: onFileWritten,
    afterUpdate: onFileWritten,
  });

  async function backfill() {
    const pending: number[] = [];
    let checked = 0;
    for (let lastId = 0; ; ) {
      const page: BlurFile[] = await files().findMany({
        select: BLUR_FILE_FIELDS,
        where: { id: { $gt: lastId }, mime: { $in: BLUR_MIME_TYPES } },
        orderBy: { id: "asc" },
        limit: BACKFILL_PAGE_SIZE,
      });
      if (page.length === 0) break;
      checked += page.length;
      lastId = page[page.length - 1].id;
      pending.push(...page.filter(needsBlur).map((file) => file.id));
    }

    if (pending.length === 0) {
      strapi.log.info(`Blur placeholders: all ${checked} images are up to date`);
      return;
    }

    strapi.log.info(
      `Blur placeholders: ${pending.length} of ${checked} images need one, creating them in the background`,
    );
    const counts: Record<Result, number> = { created: 0, skipped: 0, failed: 0 };
    for (const id of pending) {
      counts[await enqueue(id)] += 1;
      await delay(BACKFILL_PAUSE_MS);
    }
    strapi.log.info(
      `Blur placeholders: backfill done (${counts.created} created, ${counts.failed} failed, ${counts.skipped} skipped)`,
    );
  }

  // Only when the HTTP server starts: not in CLI commands that load the app (console, transfer, export…)
  strapi.server.httpServer.once("listening", () => {
    setTimeout(() => {
      backfill().catch((error) => {
        strapi.log.error(`Blur placeholders: backfill stopped: ${errorMessage(error)}`);
      });
    }, BACKFILL_DELAY_MS).unref();
  });
}
