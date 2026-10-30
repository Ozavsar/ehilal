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
  // Strapi only generates formats smaller than the original, and none for SVGs, GIFs or non-image files
  formats: Partial<Record<ImageFormatName, IImageFormat>> | null;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: unknown;
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

// Fields of a Medium body paragraph that the article renderer uses
export interface IMediumParagraph {
  name: string;
  text: string;
  type: string;
  metadata: { id: string } | null;
  iframe: { mediaResource: { iframeSrc: string; title: string | null } } | null;
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
// Strapi content types (backend/src/api/*/content-types/*/schema.json). Strapi returns every attribute,
// with null for optional ones that are empty.
export interface IStrapiSocialLinks extends IStrapiBasePage {
  email: string;
  linkedin: string;
  twitter_x: string;
  youtube: string;
  instagram: string | null;
}

export interface IStrapiBasePage {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ISEOFields {
  SEO_title: string | null;
  SEO_description: string | null;
}

// blog-page, conferences-page, courses-page and videos-page
export interface IPageTitle extends ISEOFields {
  page_title: string;
  page_title_background: string;
}

export interface INotFoundPage extends IStrapiBasePage, ISEOFields {
  image: IImage;
}

export interface IStrapiHomePage extends IStrapiBasePage, ISEOFields {
  // Optional in Strapi (null when empty)
  greeting: string | null;
  introduction: string | null;
  hero_image: IImage;
}

export interface IStrapiContactPage extends IStrapiBasePage, IPageTitle {
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

export interface IStrapiTheme extends IStrapiBasePage {
  // Hex colours; optional in Strapi
  primaryDark: string | null;
  primaryLight: string | null;
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
  // /blog/<slug> segment for articles readable on this site (Medium); null for ones that only link out (Substack)
  slug: string | null;
}

export enum BlogSource {
  MEDIUM = "Medium",
  SUBSTACK = "Substack",
}
