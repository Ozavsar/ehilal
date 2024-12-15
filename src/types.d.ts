export interface IVideoPreview {
  id: string | null | undefined;
  thumbnail: string | null | undefined;
  title: string | null | undefined;
  description: string | null | undefined;
  publishedAt: string;
}

export interface IBlog {
  _id?: string;
  title: string;
  slug?: string;
  mediumUrl: string;
  description?: string;
  content?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
