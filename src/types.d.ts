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

interface ICourse {
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
