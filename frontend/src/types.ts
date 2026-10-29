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

export interface IImage {
  id: number;
  documentId: string;
  name: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    large: IImageFormat;
    small: IImageFormat;
    medium: IImageFormat;
    thumbnail: IImageFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl: string | null;
  provider: string;
  provider_metadata: any | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  blurDataURL?: string;
}

export interface IVideoPreview {
  id: string | null | undefined;
  thumbnailURL: string | null | undefined;
  title: string | null | undefined;
  description: string | null | undefined;
  publishedAt: string; // ISO 8601, "" if unknown
  views?: string | null | undefined;
}

export interface IMediumParagraph {
  name: string;
  text: string;
  type: string;
  markups: { type: string; href: string | null }[];
  mixtapeMetadata: { href: string } | null;
  metadata: { id: string } | null;
  iframe: { mediaResource: { iframeSrc: string; title: string } } | null;
}

// Subset of the raw Medium `postResult` (PostPageQuery) returned by getSingleArticle
export interface IBlog {
  id: string;
  title: string;
  uniqueSlug: string;
  mediumUrl: string;
  firstPublishedAt: number;
  latestPublishedAt: number;
  readingTime: number;
  isLocked: boolean;
  previewImage: {
    id: string;
    alt: string | null;
    originalWidth: number;
    originalHeight: number;
  } | null;
  previewContent: { subtitle: string | null } | null;
  tags: { displayTitle: string; normalizedTagSlug: string }[];
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
export interface IStrapiSocialLinks extends IStrapiBasePage {
  email: string;
  linkedin: string;
  twitter_x: string;
  youtube: string;
  instagram?: string | null;
}

export interface IStrapiBasePage {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface IPageTitle {
  page_title: string;
  page_title_background: string;
  SEO_title: string;
  SEO_description: string;
}

export interface INotFoundPage
  extends IStrapiBasePage,
    Omit<IPageTitle, "page_title" | "page_title_background"> {
  image: IImage;
}

export interface IStrapiHomePage extends IStrapiBasePage, IPageTitle {
  greeting: string;
  introduction: string;
  hero_image: IImage;
}

export interface IStrapiContactPage extends IStrapiBasePage, IPageTitle {
  title: string;
  description: string;
  // Server-only: never pass to client components
  form_recipient_email?: string | null;
}

export interface IStrapiConference extends IStrapiBasePage {
  title: string;
  location: string;
  date: string;
  images: IImage[];
}

export interface IStrapiVideo extends IStrapiBasePage {
  title: string;
  description: string;
  publish_date: string;
  url: string;
  thumbnail: IImage;
  isFeatured: boolean;
}

export interface IStrapiTheme extends IStrapiBasePage {
  primaryDark: string;
  primaryLight: string;
}

export interface IStrapiResponse<T> {
  data: T;
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
  thumbnailURL: string;
  blurDataURL?: string | undefined;
  pubDate: string;
  isReadable?: boolean;
}

export enum BlogSource {
  MEDIUM = "Medium",
  SUBSTACK = "Substack",
}
