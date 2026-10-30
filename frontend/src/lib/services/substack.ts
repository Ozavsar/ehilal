import { z } from "zod";
import { SUBSTACK_USERNAME, SUBSTACK_USER_ID } from "@/config/constants";
import { BlogSource, type IBlogPreview } from "@/types";

export const REVALIDATE = 60 * 60; // 1 hour

// Only the fields we use: a schema change fails loudly instead of rendering undefined
const feedSchema = z.object({
  items: z.array(
    z.object({
      // Feed items without a post (e.g. notes) are skipped
      post: z
        .object({
          title: z.string(),
          slug: z.string(),
          post_date: z.string(),
          subtitle: z.string().nullish(),
          cover_image: z.string().nullish(),
        })
        .nullish(),
    }),
  ),
});

function toISODate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

// Without blur placeholders. One request, kept in the fetch cache across requests.
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
    throw new Error(`Substack request failed: ${result.status} ${result.statusText}`);
  }

  const parsed = feedSchema.safeParse(await result.json());
  if (!parsed.success) {
    throw new Error(`Unexpected Substack feed response: ${z.prettifyError(parsed.error)}`);
  }

  const posts = parsed.data.items.flatMap((item) => (item.post ? [item.post] : []));

  return posts.map(
    (post): IBlogPreview => ({
      title: post.title,
      externalURL: `https://${SUBSTACK_USERNAME}.substack.com/p/${post.slug}`,
      externalBlogSource: BlogSource.SUBSTACK,
      description: post.subtitle || "",
      thumbnailURL: post.cover_image || "",
      publishedAt: toISODate(post.post_date),
      // Substack posts are not rendered here; the card links out to Substack
      slug: null,
    }),
  );
}
