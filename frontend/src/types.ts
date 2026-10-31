export interface IImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
  sizeInBytes: number;
}

export type ImageFormatName = "large" | "medium" | "small" | "thumbnail";

// Strapi media file (plugin::upload.file)
export interface IImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  // null for files Strapi can't measure (e.g. PDFs)
  width: number | null;
  height: number | null;
  // Strapi only generates formats smaller than the original, and none for SVGs or non-image files
  formats: Partial<Record<ImageFormatName, IImageFormat>> | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  // JSON kept by the upload provider. The backend adds a blur placeholder (backend/src/utils/blur.ts):
  // validate it before use, see getStoredBlurDataURL()
  provider_metadata: { blurDataURL?: unknown } | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blurDataURL?: string;
}

// A YouTube upload as returned by lib/services/youtube.ts
export interface IVideoPreview {
  id: string;
  thumbnailURL: string; // "" if the video has no thumbnail
  title: string;
  description: string;
  publishedAt: string; // ISO 8601, "" if unknown
}

// Inline formatting of a Medium paragraph: [start, end) in UTF-16 code units of its text. Ranges
// may nest or overlap. A: a link (anchorType LINK) or a mention of a Medium user (USER, userId).
export interface IMediumMarkup {
  type: string; // "A" | "STRONG" | "EM" | "CODE"; others are ignored
  start: number;
  end: number;
  href: string | null;
  anchorType: string | null;
  userId: string | null;
}

// Fields of a Medium body paragraph that the article renderer uses
export interface IMediumParagraph {
  name: string;
  text: string;
  type: string;
  markups: IMediumMarkup[];
  // originalWidth/originalHeight: pixel size of the source image; alt: the alt text entered on
  // Medium, "" if none (image paragraphs)
  metadata: { id: string; alt: string; originalWidth?: number; originalHeight?: number } | null;
  // iframeWidth/iframeHeight: the embed's frame size, when Medium knows it
  iframe: {
    mediaResource: {
      iframeSrc: string;
      title: string | null;
      iframeWidth?: number;
      iframeHeight?: number;
    };
  } | null;
}

// Medium article rendered on /blog/<slug>, returned by getSingleArticle
export interface IBlog {
  id: string;
  slug: string; // canonical /blog/<slug> segment
  title: string;
  subtitle: string; // "" if none
  mediumUrl: string;
  previewImage: { id: string; alt: string | null } | null;
  paragraphs: IMediumParagraph[];
  // Member-only post: Medium returns only its opening paragraphs to the site
  isLocked: boolean;
}

export interface ICourse {
  title: string;
  headline: string;
  contentInfo: string;
  instructionalLevel: string;
  numReviews: string;
  udemyURL: string;
  rating: string | null;
  thumbnailURL: string | null;
  blurDataURL?: string;
}
// Strapi content types (backend/src/api/*/content-types/*/schema.json), kept in sync by hand: update them
// together with the schema. Strapi returns every attribute, with null for optional ones that are empty.
export interface IStrapiSocialLinks extends IStrapiBasePage {
  email: string;
  linkedin: string;
  twitter_x: string;
  youtube: string;
  instagram: string | null;
  // Optional: older Strapi versions don't have these fields
  medium?: string | null;
  substack?: string | null;
  udemy?: string | null;
}

export interface IStrapiBasePage {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// The single-type pages are fetched with an explicit `fields` list (lib/services/pages.ts): Strapi
// returns those plus id and documentId. Their SEO copy lives in config/seo.ts, not in Strapi.
export type IStrapiPageEntry = Pick<IStrapiBasePage, "id" | "documentId" | "updatedAt">;

// blog-page, conferences-page, courses-page and videos-page
export interface IPageTitle extends IStrapiPageEntry {
  page_title: string;
  page_title_background: string;
}

export interface INotFoundPage extends IStrapiPageEntry {
  image: IImage;
}

export interface IStrapiHomePage extends IStrapiPageEntry {
  // Optional in Strapi (null when empty)
  greeting: string | null;
  introduction: string | null;
  hero_image: IImage;
}

export interface IStrapiContactPage extends IPageTitle {
  title: string;
  description: string;
  // Server-only: never pass to client components. Required in the schema, but null on entries saved before it existed
  form_recipient_email: string | null;
}

export interface IStrapiConference extends IStrapiBasePage {
  title: string;
  location: string;
  date: string; // YYYY-MM-DD
  images: IImage[];
}

export interface IStrapiVideo extends IStrapiBasePage {
  title: string;
  description: string | null;
  publish_date: string; // YYYY-MM-DD
  url: string;
  thumbnail: IImage | null;
  isFeatured: boolean | null;
}

export type ThemeVariant =
  | "tonal_spot"
  | "vibrant"
  | "expressive"
  | "fidelity"
  | "content"
  | "neutral"
  | "rainbow"
  | "fruit_salad"
  | "monochrome";

export interface IStrapiTheme extends IStrapiBasePage {
  source_type: "color" | "image" | null;
  seed_color: string | null; // hex
  variant: ThemeVariant | null;
  // Generated by Strapi on save; unknown until validated with parsePalette() (lib/palette.ts)
  palette: unknown;
  image_candidates: string[] | null;
  // Legacy hex colours, no longer read; removed from Strapi in a later release
  primaryDark: string | null;
  primaryLight: string | null;
}

export interface IStrapiSiteSettings extends IStrapiBasePage {
  // Every field may be empty; getSiteSettings() falls back to DEFAULT_SITE_SETTINGS per field
  site_name: string | null;
  job_title: string | null;
  site_description: string | null;
  default_og_image: IImage | null;
  twitter_handle: string | null;
  twitter_user_id: string | null;
  karakod_url: string | null;
  karakod_linkedin_url: string | null;
  legalifi_url: string | null;
}

// Site Settings with the defaults filled in, as returned by getSiteSettings()
export interface ISiteSettings {
  siteName: string;
  jobTitle: string;
  siteDescription: string;
  twitterHandle: string; // with the leading "@"
  twitterUserId: string;
  defaultOgImage: { url: string; width?: number; height?: number; alt?: string };
  karakodUrl: string;
  karakodLinkedinUrl: string;
  legalifiUrl: string;
}

// Single types answer with an empty `meta`
export interface IStrapiResponse<T> {
  data: T;
  meta: Record<string, never>;
}

export interface IStrapiCollectionResponse<T> {
  data: T[];
  meta: {
    pagination: {
      start?: number;
      limit?: number;
      page?: number;
      pageSize?: number;
      pageCount?: number;
      total: number;
    };
  };
}

export interface IUnifiedVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailURL: string;
  publish_date: string; // ISO 8601; format only when displaying
  isFeatured?: boolean;
  source: "youtube" | "strapi";
  blurDataURL?: string;
}
export interface IBlogPreview {
  title: string;
  externalURL: string;
  externalBlogSource: BlogSource;
  description: string;
  thumbnailURL: string; // "" if the post has no cover image
  blurDataURL?: string;
  publishedAt: string; // ISO 8601, "" if unknown; format only when displaying
  updatedAt?: string; // ISO 8601, last republished (Medium); undefined if unknown
  // /blog/<slug> segment for articles readable on this site (Medium); null for ones that only link out (Substack)
  slug: string | null;
  // Medium tag slugs ("ccip", "chain-link"); undefined for Substack
  tags?: string[];
}

export enum BlogSource {
  MEDIUM = "Medium",
  SUBSTACK = "Substack",
}
