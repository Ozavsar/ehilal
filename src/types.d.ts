export interface IVideoPreview {
  id: string | null | undefined;
  thumbnail: string | null | undefined;
  title: string | null | undefined;
  description: string | null | undefined;
  publishedAt: string;
}

export interface IBlog {
  title: string;
  mediumUrl: string;
  description?: string;
  thumbnailUrl?: string;
}
