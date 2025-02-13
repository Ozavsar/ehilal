import { StaticImageData } from "next/image";

interface IImageFormat {
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

interface IImage {
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
}

export interface IVideoPreview {
  id: string | null | undefined;
  thumbnailURL: string | null | undefined;
  title: string | null | undefined;
  description: string | null | undefined;
  publishedAt: string;
  views?: string | null | undefined;
}

export interface IBlog {
  title: string;
  mediumURL: string;
  description?: string;
  thumbnailURL?: string;
}

export interface ICourse {
  title: string;
  headline: string;
  contentInfo: string;
  numLectures: string;
  instructionalLevel: string;
  numReviews: string;
  udemyURL: string;
  rating: string | null;
  thumbnailURL: string | null;
}

export interface IConference {
  title: string;
  location: string;
  timestamp: number;
  images: StaticImageData[];
}

export interface IStrapiBasePage {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface IStrapiHomePage extends IStrapiBasePage {
  greeting: string;
  introduction: string;
}

export interface IStrapiContactPage extends IStrapiBasePage {
  title: string;
  description: string;
  page_title: string;
  page_title_background: string;
}

export interface IStrapiConference extends IStrapiBasePage {
  title: string;
  location: string;
  date: string;
  images: IImage[];
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
