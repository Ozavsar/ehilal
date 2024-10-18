export interface IArticlePreview {
  title: string;
  url: string;
  image?: string;
  description?: string;
}

export interface IVideoPreview {
  id: string | null | undefined;
  thumbnail: string | null | undefined;
  title: string | null | undefined
  description: string | null | undefined;
  publishedAt: string;
}