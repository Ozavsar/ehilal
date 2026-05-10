import { SUBSTACK_USERNAME, SUBSTACK_USER_ID } from "@/config/constants";
import { BlogSource, type IBlogPreview } from "@/types";
import { getImage } from "../getImage";

export const REVALIDATE = 60 * 60; // 1 hour

export async function getAllArticlePreviews(): Promise<IBlogPreview[]> {
  const url = new URL(`https://substack.com/api/v1/reader/feed/profile/${SUBSTACK_USER_ID}`);

  const result = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "force-cache",
    next: {
      tags: ["articles"],
      revalidate: REVALIDATE,
    },
  });

  if (!result.ok) {
    return [];
  }

  const data = await result.json();

  const currentYear = new Date().getFullYear();

  const previews: IBlogPreview[] = await Promise.all(
    data.items.map(async (item: any) => {
      const post = item.post;
      const date = new Date(post.post_date);
      const isCurrentYear = date.getFullYear() === currentYear;

      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(isCurrentYear ? {} : { year: "numeric" }),
      });

      let blurDataURL = "";
      if (post.cover_image) {
        try {
          const placeholder = await getImage(post.cover_image);
          blurDataURL = placeholder.base64;
        } catch (err) {
          console.warn("couldn't get placeholder:", post.cover_image);
        }
      }
      return {
        title: post.title,
        externalURL: `https://${SUBSTACK_USERNAME}.substack.com/p/${post.slug}`,
        externalBlogSource: BlogSource.SUBSTACK,
        description: post.subtitle || "",
        thumbnailURL: post.cover_image || null,
        blurDataURL,
        pubDate: formattedDate,
      } as IBlogPreview;
    }),
  );

  return previews;
}
