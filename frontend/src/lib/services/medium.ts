import { MEDIUM_USER_ID } from "@/config/constants";
import type { IBlogPreview, IBlog } from "@/types";

// Simple request throttler to avoid Medium rate limiting
const throttler = {
  queue: [] as Array<() => void>,
  running: 0,
  maxConcurrent: 2, // Max concurrent requests
  delayMs: 2000, // Delay between requests

  async acquire(): Promise<void> {
    if (this.running < this.maxConcurrent) {
      this.running++;
      return;
    }

    return new Promise((resolve) => {
      this.queue.push(resolve);
    });
  },

  async release(): Promise<void> {
    await new Promise((r) => setTimeout(r, this.delayMs));
    this.running--;

    const next = this.queue.shift();
    if (next) {
      this.running++;
      next();
    }
  },
};

export async function getAllArticlePreviews(): Promise<IBlogPreview[]> {
  const allPreviews: IBlogPreview[] = [];
  let from: string | null = null;
  const limit = 10;

  const query = `
    query UserProfileQuery(
      $id: ID
      $username: ID
      $limit: PaginationLimit = 10
      $from: String = null
    ) {
    userResult(id: $id, username: $username) {
      ... on User {
        id
        name
        username
        bio
        imageId
        socialStats {
          followerCount
          followingCount
        }
        homepagePostsConnection(
          paging: { limit: $limit, from: $from }
          includeDistributedResponses: true
        ) {
          posts {
            id
            title
            uniqueSlug
            mediumUrl
            previewImage {
              id
              alt
            }
            extendedPreviewContent {
                subtitle
            }
            firstPublishedAt
            readingTime
          }
          pagingInfo {
            next {
              from
              limit
            }
          }
        }
      }
    }
  }
  `;

  while (true) {
    const res = await fetch("https://medium.com/_/graphql", {
      method: "POST",
      headers: {
        "User-Agent": "PostmanRuntime/7.49.1",
        Accept: "*/*",
        "Postman-Token": "a90cc4c4-9640-4589-a0bc-451c81a6fd5b",
        Host: "medium.com",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { id: MEDIUM_USER_ID, limit, from },
      }),
      cache: "force-cache",
      next: {
        tags: ["articles"],
      },
    });

    const json = await res.json();
    const posts = json.data?.userResult?.homepagePostsConnection?.posts ?? [];
    const next =
      json.data?.userResult?.homepagePostsConnection?.pagingInfo?.next;

    const currentYear = new Date().getFullYear();

    const formatted: IBlogPreview[] = posts.map((post: any) => {
      const date = new Date(post.firstPublishedAt);
      const isCurrentYear = date.getFullYear() === currentYear;

      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(isCurrentYear ? {} : { year: "numeric" }),
      });

      return {
        title: post.title,
        mediumURL: post.mediumUrl,
        description: post.extendedPreviewContent?.subtitle || "",
        thumbnailURL: post.previewImage
          ? `https://miro.medium.com/v2/da:true/${post.previewImage.id}`
          : "",
        pubDate: formattedDate,
      };
    });

    // console.log(formatted);

    allPreviews.push(...formatted);

    if (!next?.from) break;
    from = next.from;

    // avoid Medium throttling
    await new Promise((r) => setTimeout(r, 500));
  }

  const articlesWithPlaceholders = await Promise.all(
    allPreviews.map(async (article) => ({
      ...article,
      /*       blurDataURL: (article as any).thumbnailURL
        ? (await getImage((article as any).thumbnailURL)).base64
        : undefined, */
    })),
  );

  return articlesWithPlaceholders;
}

export async function getSingleArticle(postId: string): Promise<IBlog | null> {
  await throttler.acquire();

  try {
    const query = `
query PostPageQuery(
  $postId: ID!,
  $postMeteringOptions: PostMeteringOptions,
  $includeShouldFollowPost: Boolean = false
) {
  postResult(id: $postId) {
    ... on Post {
      id
      title
      uniqueSlug
      mediumUrl
      firstPublishedAt
      latestPublishedAt
      readingTime
      isLocked
      content(postMeteringOptions: $postMeteringOptions) {
        isLockedPreviewOnly
        bodyModel {
          paragraphs {
            name
            text
            type
            markups {
              type
              href
            }
            mixtapeMetadata {
              href
            }
            metadata {
                id
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
        originalHeight
        originalWidth
        focusPercentX
        focusPercentY
      }
      previewContent {
        subtitle
      }
      tags {
        displayTitle
        normalizedTagSlug
      }
      creator {
        id
        name
        username
        imageId
        bio
        socialStats {
          followerCount
        }
      }
      collection {
        id
        name
        slug
        domain
        description
      }
      viewerEdge @include(if: $includeShouldFollowPost) {
        shouldFollowPostForExternalSearch
      }
    }
  }
}
  `;

    const res = await fetch("https://medium.com/_/graphql", {
      method: "POST",
      headers: {
        "User-Agent": "PostmanRuntime/7.49.1",
        Accept: "*/*",
        "Postman-Token": "a90cc4c4-9640-4589-a0bc-451c81a6fd5b",
        Host: "medium.com",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: { postId, includeShouldFollowPost: false },
      }),
      cache: "force-cache",
      next: {
        tags: ["articles", `article-${postId}`],
      },
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) {
      console.error(
        `Medium API error for getAllArticlePreviews: status ${res.status}, postId: ${postId}`,
      );
      throw new Error(`Medium API returned non-JSON response: ${res.status}`);
    }

    const json = await res.json();

    if (!json.data?.postResult) {
      return null;
    }

    return {
      ...json.data.postResult,
      paragraphs: json.data.postResult.content.bodyModel.paragraphs || [],
    };
  } finally {
    await throttler.release();
  }
}
