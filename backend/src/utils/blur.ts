import sharp from "sharp";

/**
 * Blur placeholders for uploaded images, stored in the file's `provider_metadata` as
 * `{ blurDataURL, blurFingerprint }` and read by the frontend.
 */

// Raster formats sharp reads. SVGs are skipped: no Strapi formats, a poor placeholder for a logo
export const BLUR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
  "image/gif",
];

// The fields of a plugin::upload.file row the blur needs
export interface BlurFile {
  id: number;
  hash: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  url: string;
  formats: Record<string, { url?: string } | undefined> | null;
  provider: string;
  provider_metadata: unknown;
}

export const BLUR_FILE_FIELDS = [
  "id",
  "hash",
  "mime",
  "size",
  "width",
  "height",
  "url",
  "formats",
  "provider",
  "provider_metadata",
] as const;

type Metadata = Record<string, unknown>;

const isMetadata = (value: unknown): value is Metadata =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Identifies the image content. Not just the hash: Strapi keeps it when a file is replaced. */
export function getBlurFingerprint(file: Pick<BlurFile, "hash" | "size" | "width" | "height">) {
  return `${file.hash}:${file.size}:${file.width}x${file.height}`;
}

/**
 * Whether the file is an image without an up-to-date placeholder. Non-object provider_metadata is
 * left alone, so nothing a provider stored there is overwritten.
 */
export function needsBlur(file: BlurFile): boolean {
  if (!BLUR_MIME_TYPES.includes(file.mime)) return false;
  const metadata = file.provider_metadata;
  if (metadata === null || metadata === undefined) return true;
  if (!isMetadata(metadata)) return false;
  return (
    typeof metadata.blurDataURL !== "string" ||
    metadata.blurFingerprint !== getBlurFingerprint(file)
  );
}

/** The smallest copy of the image (small images have no formats). */
export function getBlurSourceURL(file: Pick<BlurFile, "url" | "formats">): string {
  return file.formats?.thumbnail?.url ?? file.formats?.small?.url ?? file.url;
}

export function withBlur(metadata: unknown, blurDataURL: string, fingerprint: string): Metadata {
  return { ...(isMetadata(metadata) ? metadata : {}), blurDataURL, blurFingerprint: fingerprint };
}

/**
 * A 10px PNG data URL built like the frontend's `getPlaiceholder(buffer, { size: 10 })`, so stored
 * and computed placeholders look the same.
 */
export async function createBlurDataURL(image: Buffer): Promise<string> {
  const { data, info } = await sharp(image)
    .resize(10, 10, { fit: "inside" })
    .toFormat("png")
    .modulate({ brightness: 1, saturation: 1.2 })
    .normalise()
    .toBuffer({ resolveWithObject: true });
  return `data:image/${info.format};base64,${data.toString("base64")}`;
}
