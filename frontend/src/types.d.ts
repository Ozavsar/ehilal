import { StaticImageData } from "next/image";

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

export interface IStrapiResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}
