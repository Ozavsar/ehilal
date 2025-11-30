import { BlogSource, MEDIUM_USER_ID } from "@/config/constants";
import { getImage } from "../getImage";
import { type IBlogPreview, type IBlog } from "@/types";

export const REVALIDATE = 3600; // 1 hour

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
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 ... Chrome/123",
        Referer: "https://medium.com/",
        Origin: "https://medium.com",
        "Accept-Language": "en-US,en;q=0.9",
      },
      body: JSON.stringify({
        query,
        variables: { id: MEDIUM_USER_ID, limit, from },
      }),
      cache: "force-cache",
      next: {
        tags: ["articles"],
        revalidate: REVALIDATE,
      },
    });

    const json: any = await res.json();
    const posts = json.data?.userResult?.homepagePostsConnection?.posts ?? [];
    const next =
      json.data?.userResult?.homepagePostsConnection?.pagingInfo?.next;

    const currentYear = new Date().getFullYear();

    const formattedPromises = posts.map(async (post: any) => {
      const date = new Date(post.firstPublishedAt);
      const isCurrentYear = date.getFullYear() === currentYear;

      const imageUrl = post.previewImage
        ? `https://miro.medium.com/v2/da:true/${post.previewImage.id}`
        : null;

      let blurDataURL = "";
      if (imageUrl) {
        try {
          const placeholder = await getImage(imageUrl);
          blurDataURL = placeholder.base64;
        } catch (err) {
          console.warn("Placeholder alınamadı:", imageUrl);
        }
      }

      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(isCurrentYear ? {} : { year: "numeric" }),
      });

      return {
        title: post.title,
        externalURL: post.mediumUrl,
        externalBlogSource: BlogSource.MEDIUM,
        description: post.extendedPreviewContent?.subtitle || "",
        thumbnailURL: imageUrl ?? "",
        blurDataURL,
        pubDate: formattedDate,
        isReadable: true,
      };
    });

    const formatted = await Promise.all(formattedPromises);
    allPreviews.push(...formatted);

    if (!next?.from) break;
    from = next.from;

    await new Promise((r) => setTimeout(r, 2000));
  }

  return allPreviews;
}

export async function getSingleArticle(postId: string): Promise<IBlog | null> {
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
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 ... Chrome/123",
      Referer: "https://medium.com/",
      Origin: "https://medium.com",
      "Accept-Language": "en-US,en;q=0.9",
    },
    body: JSON.stringify({
      query,
      variables: { postId, includeShouldFollowPost: false },
    }),
    cache: "force-cache",
    next: {
      tags: ["articles", `article-${postId}`],
      revalidate: REVALIDATE,
    },
  });

  const json: any = await res.json();

  if (!json.data?.postResult) {
    return null;
  }

  return {
    ...json.data.postResult,
    paragraphs: json.data.postResult.content.bodyModel.paragraphs || [],
  };
}
