import { unstable_cache } from "next/cache";
import { z } from "zod";
import { MEDIUM_USER_ID } from "@/config/constants";
import { getCleanSlug } from "@/lib/utils";
import { BlogSource, type IBlog, type IBlogPreview, type IMediumParagraph } from "@/types";

export const REVALIDATE = 60 * 60; // 1 hour

const GRAPHQL_URL = "https://medium.com/_/graphql";
const MEDIUM_IMAGE_URL = "https://miro.medium.com/v2";
const PAGE_SIZE = 10;
// Guards the paging loop against a cursor that never ends
const MAX_LIST_PAGES = 20;
// Medium post ids are lowercase hex: 12 characters, fewer when they start with zeros (e.g. 958f3fd6de6)
const POST_ID_PATTERN = /^[0-9a-f]{8,12}$/;

const HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/plain, */*",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  Referer: "https://medium.com/",
  Origin: "https://medium.com",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Fetch-Site": "same-origin",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Dest": "empty",
  "Sec-Ch-Ua": '"Chromium";v="143", "Not.A/Brand";v="24", "Google Chrome";v="143"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  DNT: "1",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

const LIST_QUERY = `
  query UserProfileQuery($id: ID, $limit: PaginationLimit = 10, $from: String = null) {
    userResult(id: $id) {
      ... on User {
        homepagePostsConnection(
          paging: { limit: $limit, from: $from }
          includeDistributedResponses: true
        ) {
          posts {
            id
            title
            mediumUrl
            previewImage {
              id
            }
            extendedPreviewContent {
              subtitle
            }
            firstPublishedAt
          }
          pagingInfo {
            next {
              from
            }
          }
        }
      }
    }
  }
`;

const POST_QUERY = `
  query PostPageQuery($postId: ID!) {
    postResult(id: $postId) {
      __typename
      ... on Post {
        id
        title
        mediumUrl
        creator {
          id
        }
        content {
          bodyModel {
            paragraphs {
              name
              text
              type
              metadata {
                id
                originalWidth
                originalHeight
              }
              iframe {
                mediaResource {
                  iframeSrc
                  title
                }
              }
            }
          }
        }
        previewImage {
          id
          alt
        }
        previewContent {
          subtitle
        }
      }
    }
  }
`;

// Only the fields we use: a schema change fails loudly instead of rendering undefined
const listResponseSchema = z.object({
  data: z.object({
    userResult: z.object({
      homepagePostsConnection: z.object({
        posts: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            mediumUrl: z.string(),
            previewImage: z.object({ id: z.string() }).nullish(),
            extendedPreviewContent: z.object({ subtitle: z.string().nullish() }).nullish(),
            firstPublishedAt: z.number(),
          }),
        ),
        pagingInfo: z.object({
          next: z.object({ from: z.string().nullish() }).nullish(),
        }),
      }),
    }),
  }),
});

// Unknown ids come back as { __typename: "NotFound" }
const postEnvelopeSchema = z.object({
  data: z.object({
    postResult: z.object({ __typename: z.string() }).nullish(),
  }),
});

const paragraphSchema = z.object({
  name: z.string(),
  text: z.string().nullish(),
  type: z.string(),
  metadata: z
    .object({
      id: z.string(),
      originalWidth: z.number().nullish(),
      originalHeight: z.number().nullish(),
    })
    .nullish(),
  iframe: z
    .object({
      mediaResource: z.object({ iframeSrc: z.string(), title: z.string().nullish() }),
    })
    .nullish(),
});

// Parsed from the raw response once the envelope says it is a Post
const postResponseSchema = z.object({
  data: z.object({
    postResult: z.object({
      id: z.string(),
      title: z.string(),
      mediumUrl: z.string(),
      creator: z.object({ id: z.string() }).nullish(),
      content: z
        .object({
          bodyModel: z.object({ paragraphs: z.array(paragraphSchema) }).nullish(),
        })
        .nullish(),
      previewImage: z.object({ id: z.string(), alt: z.string().nullish() }).nullish(),
      previewContent: z.object({ subtitle: z.string().nullish() }).nullish(),
    }),
  }),
});

function parseResponse<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Unexpected Medium ${label} response: ${z.prettifyError(result.error)}`);
  }
  return result.data;
}

async function queryMedium(
  query: string,
  variables: Record<string, unknown>,
  tags: string[],
): Promise<unknown> {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query, variables }),
    cache: "force-cache",
    next: { tags, revalidate: REVALIDATE },
  });
  if (!res.ok) {
    throw new Error(`Medium request failed: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// /blog/<slug> segment: the cleaned last part of the Medium URL, which ends with the post id
function getMediumArticleSlug(mediumUrl: string): string {
  const path = mediumUrl.split(/[?#]/)[0] ?? "";
  const lastPart = path.split("/").filter(Boolean).pop() ?? "";
  return getCleanSlug(lastPart);
}

// Post id at the end of a /blog/<slug> segment, or null if it can't be a Medium id
export function getMediumPostId(slug: string): string | null {
  const postId = slug.slice(slug.lastIndexOf("-") + 1);
  return POST_ID_PATTERN.test(postId) ? postId : null;
}

async function fetchAllArticlePreviews(): Promise<IBlogPreview[]> {
  const previews: IBlogPreview[] = [];
  let from: string | null = null;

  for (let page = 0; page < MAX_LIST_PAGES; page++) {
    const json = await queryMedium(LIST_QUERY, { id: MEDIUM_USER_ID, limit: PAGE_SIZE, from }, [
      "articles",
    ]);
    const { posts, pagingInfo } = parseResponse(listResponseSchema, json, "post list").data
      .userResult.homepagePostsConnection;

    previews.push(
      ...posts.map(
        (post): IBlogPreview => ({
          title: post.title,
          externalURL: post.mediumUrl,
          externalBlogSource: BlogSource.MEDIUM,
          description: post.extendedPreviewContent?.subtitle || "",
          thumbnailURL: post.previewImage?.id
            ? `${MEDIUM_IMAGE_URL}/da:true/${post.previewImage.id}`
            : "",
          publishedAt: new Date(post.firstPublishedAt).toISOString(),
          slug: getMediumArticleSlug(post.mediumUrl),
        }),
      ),
    );

    const next = pagingInfo.next?.from;
    if (!next) break;
    from = next;
  }

  return previews;
}

/**
 * Every post the user published, newest first, without blur placeholders. The list takes one
 * request per 10 posts, so it is cached as a whole across requests (fetches inside unstable_cache
 * are not cached on their own). Errors aren't cached; a failed refresh keeps the previous list.
 */
export const getAllArticlePreviews = unstable_cache(
  fetchAllArticlePreviews,
  ["medium-article-previews"],
  { revalidate: REVALIDATE, tags: ["articles"] },
);

// Returns null for unknown ids, posts without a body and posts by other authors.
// Throws on network/HTTP failures and unexpected response shapes.
export async function getSingleArticle(postId: string): Promise<IBlog | null> {
  const json = await queryMedium(POST_QUERY, { postId }, ["articles", `article-${postId}`]);

  const { postResult } = parseResponse(postEnvelopeSchema, json, "post").data;
  if (postResult?.__typename !== "Post") {
    return null;
  }

  const post = parseResponse(postResponseSchema, json, "post").data.postResult;
  const paragraphs = post.content?.bodyModel?.paragraphs;
  // Any public Medium post id would resolve; only render the site owner's posts
  if (!paragraphs || post.creator?.id !== MEDIUM_USER_ID) {
    return null;
  }

  return {
    id: post.id,
    slug: getMediumArticleSlug(post.mediumUrl),
    title: post.title,
    subtitle: post.previewContent?.subtitle?.trim() || "",
    mediumUrl: post.mediumUrl,
    previewImage: post.previewImage
      ? { id: post.previewImage.id, alt: post.previewImage.alt ?? null }
      : null,
    paragraphs: paragraphs.map(
      (p): IMediumParagraph => ({
        name: p.name,
        text: p.text ?? "",
        type: p.type,
        metadata: p.metadata
          ? {
              id: p.metadata.id,
              originalWidth: p.metadata.originalWidth ?? undefined,
              originalHeight: p.metadata.originalHeight ?? undefined,
            }
          : null,
        iframe: p.iframe
          ? {
              mediaResource: {
                iframeSrc: p.iframe.mediaResource.iframeSrc,
                title: p.iframe.mediaResource.title ?? null,
              },
            }
          : null,
      }),
    ),
  };
}
