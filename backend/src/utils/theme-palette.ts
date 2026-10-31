import type { Core } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import { BLUR_FILE_FIELDS, type BlurFile, getBlurFingerprint } from "./blur";
import {
  DEFAULT_SEED,
  DEFAULT_VARIANT,
  extractCandidates,
  generatePalette,
  getPaletteFingerprint,
  isCandidateList,
  isHexColor,
  isPalette,
  isSourceType,
  isVariant,
  normalizeHex,
  PALETTE_VERSION,
  type Palette,
  SPEC_VERSION,
  type SourceType,
  type Variant,
} from "./m3-palette";
import { loadImage, signFileUrls } from "./upload-blur";

/**
 * Keeps the theme's generated fields (`palette`, `image_candidates`) in sync with its source fields
 * on every save; whatever a request sends for the generated fields is replaced.
 */

const THEME_UID = "api::theme.theme";
const FILE_UID = "plugin::upload.file";

type Fields = Record<string, unknown>;

/** The theme's source fields, as they will be stored. */
export interface ThemeState {
  sourceType: unknown;
  seedColor: unknown;
  variant: unknown;
  image: ThemeImage | null;
}

export interface ThemeImage {
  id: number;
  // Changes when the file content changes, even if the id stays (replaced in the media library)
  fingerprint: string;
}

/** The generated fields as currently stored. */
export interface StoredPalette {
  palette: unknown;
  imageCandidates: unknown;
}

export interface ThemePaletteFields {
  source_type: SourceType;
  variant: Variant;
  seed_color: string;
  palette: Palette;
  image_candidates: string[] | null;
}

const validationError = (field: string, message: string) =>
  new errors.ValidationError(message, {
    errors: [{ path: [field], message, name: "ValidationError" }],
  });

const isRecord = (value: unknown): value is Fields =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * The generated fields for a theme state; `loadCandidates` runs only when the image changed or has
 * no candidates. Throws a ValidationError (shown on the field in the admin) for an invalid state.
 */
export async function resolveThemePalette(
  state: ThemeState,
  stored: StoredPalette,
  loadCandidates: (image: ThemeImage) => Promise<string[]>,
): Promise<ThemePaletteFields> {
  const sourceType = state.sourceType ?? "color";
  if (!isSourceType(sourceType)) throw validationError("source_type", "Unknown palette source");
  const variant = state.variant ?? DEFAULT_VARIANT;
  if (!isVariant(variant)) throw validationError("variant", "Unknown palette variant");

  const entered = typeof state.seedColor === "string" ? state.seedColor.trim() : "";
  if (entered && !isHexColor(entered)) {
    throw validationError("seed_color", "Enter the seed colour as a hex value, e.g. #bf2821");
  }
  const storedPalette = isPalette(stored.palette) ? stored.palette : null;

  // The stored palette when it was built from the same input, a new one otherwise
  const build = (seed: string, source: Omit<Palette["source"], "seed">): Palette => {
    const fingerprint = getPaletteFingerprint({
      version: PALETTE_VERSION,
      source: { ...source, seed: normalizeHex(seed) },
      options: { variant, specVersion: SPEC_VERSION },
    });
    if (storedPalette && getPaletteFingerprint(storedPalette) === fingerprint) return storedPalette;
    return generatePalette({ seed, variant, source });
  };

  if (sourceType === "color") {
    if (!entered) throw validationError("seed_color", "Choose a seed colour");
    return {
      source_type: sourceType,
      variant,
      seed_color: entered,
      palette: build(entered, { type: "color", imageId: null }),
      image_candidates: null,
    };
  }

  const { image } = state;
  if (!image) {
    throw validationError("source_image", "Choose an image, or switch the source to colour");
  }
  const sameImage =
    storedPalette?.source.type === "image" &&
    storedPalette.source.imageId === image.id &&
    storedPalette.source.imageFingerprint === image.fingerprint;
  const candidates =
    sameImage && isCandidateList(stored.imageCandidates)
      ? stored.imageCandidates
      : await loadCandidates(image);
  if (candidates.length === 0) {
    throw validationError("source_image", "No colours could be read from this image");
  }

  // A new image starts from its best candidate; afterwards the editor's choice is kept
  const seed = sameImage && entered ? entered : candidates[0];
  return {
    source_type: sourceType,
    variant,
    seed_color: seed,
    palette: build(seed, { type: "image", imageId: image.id, imageFingerprint: image.fingerprint }),
    image_candidates: candidates,
  };
}

/**
 * The media id a write sets: a number for an id (or `{ id }`, `[{ id }]`, `{ set }`, `{ connect }`),
 * null when it clears the image, undefined when the value doesn't say (keep the stored image).
 */
export function readMediaId(value: unknown): number | null | undefined {
  if (value === null) return null;
  if (typeof value === "number") return Number.isInteger(value) ? value : undefined;
  if (typeof value === "string") return /^\d+$/.test(value) ? Number(value) : undefined;
  if (Array.isArray(value)) return value.length === 0 ? null : readMediaId(value[value.length - 1]);
  if (!isRecord(value)) return undefined;
  if ("set" in value) return readMediaId(value.set);
  if (Array.isArray(value.connect) && value.connect.length > 0) return readMediaId(value.connect);
  if (Array.isArray(value.disconnect) && value.disconnect.length > 0) return null;
  if ("id" in value && !("connect" in value) && !("disconnect" in value)) {
    return readMediaId(value.id);
  }
  return undefined;
}

export function changedFields(stored: Fields, next: ThemePaletteFields): Partial<ThemePaletteFields> {
  const changes: Fields = {};
  for (const [key, value] of Object.entries(next)) {
    if (JSON.stringify(stored[key] ?? null) !== JSON.stringify(value)) changes[key] = value;
  }
  return changes as Partial<ThemePaletteFields>;
}

const errorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

interface ThemeRow extends Fields {
  id: number;
  documentId: string;
  publishedAt: string | null;
  source_image?: BlurFile | null;
}

const toThemeImage = (file: BlurFile | null | undefined): ThemeImage | null =>
  file ? { id: file.id, fingerprint: getBlurFingerprint(file) } : null;

const stateOf = (row: Fields, image: BlurFile | null | undefined): ThemeState => ({
  sourceType: row.source_type,
  seedColor: row.seed_color,
  variant: row.variant,
  image: toThemeImage(image),
});

const storedOf = (row: Fields | null): StoredPalette => ({
  palette: row?.palette,
  imageCandidates: row?.image_candidates,
});

// Theme rows and files, shared by the middleware and the backfill
function createThemeStore(strapi: Core.Strapi) {
  const populate = { source_image: { select: [...BLUR_FILE_FIELDS] } };
  const themes = () => strapi.db.query(THEME_UID);
  const findFile = (id: number): Promise<BlurFile | null> =>
    strapi.db.query(FILE_UID).findOne({ where: { id }, select: [...BLUR_FILE_FIELDS] });

  // Candidates from the "small" format (500px): plenty for a 128px quantizer copy
  async function loadCandidates(image: ThemeImage): Promise<string[]> {
    try {
      const file = await findFile(image.id);
      if (!file) throw new Error("file not found");
      const { url, formats } = await signFileUrls(strapi, file);
      const source = formats?.small?.url ?? formats?.thumbnail?.url ?? url;
      return await extractCandidates(await loadImage(strapi, source));
    } catch (error) {
      strapi.log.warn(`Theme palette: image ${image.id} could not be read: ${errorMessage(error)}`);
      throw validationError("source_image", "The image could not be read, try another one");
    }
  }

  return {
    populate,
    themes,
    findFile,
    loadCandidates,

    // Brings a stored version up to date, writing only the fields that changed
    async refreshRow(row: ThemeRow, state: ThemeState): Promise<boolean> {
      const fields = await resolveThemePalette(state, storedOf(row), loadCandidates);
      const changes = changedFields(row, fields);
      if (Object.keys(changes).length === 0) return false;
      await themes().update({ where: { id: row.id }, data: changes });
      return true;
    },
  };
}

/**
 * Generates the palette on every theme write (document service middleware). Call in register().
 */
export function registerThemePalette(strapi: Core.Strapi) {
  const { populate, themes, findFile, loadCandidates, refreshRow } = createThemeStore(strapi);

  // The draft, or the published version when the document has no draft yet
  const findVersion = async (documentId: string): Promise<ThemeRow | null> =>
    (await themes().findOne({ where: { documentId, publishedAt: null }, populate })) ??
    (await themes().findOne({ where: { documentId }, populate }));

  // The image a write leaves on the theme
  async function writtenImage(data: Fields, current: ThemeRow | null) {
    if (!("source_image" in data)) return current?.source_image ?? null;
    const id = readMediaId(data.source_image);
    if (id === undefined) return current?.source_image ?? null;
    if (id === null) return null;
    return current?.source_image?.id === id ? current.source_image : findFile(id);
  }

  strapi.documents.use(async (context, next) => {
    if (context.uid !== THEME_UID) return next();

    if (context.action === "create" || context.action === "update") {
      const params = context.params as { documentId?: string; data?: unknown };
      const data = isRecord(params.data) ? params.data : {};
      const current = params.documentId ? await findVersion(params.documentId) : null;
      const fields = await resolveThemePalette(
        stateOf({ ...current, ...data }, await writtenImage(data, current)),
        storedOf(current),
        loadCandidates,
      );
      const written: Fields = { ...data, ...fields };
      context.params = { ...params, data: written } as typeof context.params;
    } else if (context.action === "publish") {
      // Publish copies the draft: make sure the draft's palette is current first
      const { documentId } = context.params as { documentId?: string };
      if (documentId) {
        const drafts: ThemeRow[] = await themes().findMany({
          where: { documentId, publishedAt: null },
          populate,
        });
        for (const draft of drafts) await refreshRow(draft, stateOf(draft, draft.source_image));
      }
    }
    return next();
  });
}

/**
 * Once the HTTP server is up: versions without a palette get one from the legacy primaryLight, and
 * outdated ones (new PALETTE_VERSION) are regenerated. Idempotent. Call in bootstrap().
 */
export function scheduleThemePaletteBackfill(strapi: Core.Strapi) {
  const { populate, themes, refreshRow } = createThemeStore(strapi);

  async function backfill() {
    // Oldest first, so the draft/published order of updatedAt (the "Modified" status) is kept
    const rows: ThemeRow[] = await themes().findMany({ populate, orderBy: { updatedAt: "asc" } });
    let updated = 0;
    for (const row of rows) {
      const state: ThemeState = isPalette(row.palette)
        ? stateOf(row, row.source_image)
        : {
            sourceType: "color",
            seedColor: [row.seed_color, row.primaryLight].find(isHexColor) ?? DEFAULT_SEED,
            variant: isVariant(row.variant) ? row.variant : DEFAULT_VARIANT,
            image: toThemeImage(row.source_image),
          };
      try {
        if (await refreshRow(row, state)) updated += 1;
      } catch (error) {
        const version = row.publishedAt ? "published" : "draft";
        strapi.log.warn(`Theme palette: ${version} version left as is: ${errorMessage(error)}`);
      }
    }
    if (updated > 0) strapi.log.info(`Theme palette: generated for ${updated} theme version(s)`);
  }

  strapi.server.httpServer.once("listening", () => {
    backfill().catch((error) => {
      strapi.log.error(`Theme palette: backfill stopped: ${errorMessage(error)}`);
    });
  });
}
