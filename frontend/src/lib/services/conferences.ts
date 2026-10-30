import { fetchAPI } from "../api/fetchAPI";
import { getStrapiBlurDataURL } from "../getImage";
import type { IImage, IStrapiCollectionResponse, IStrapiConference } from "@/types";

// The media field may hold non-image uploads, which next/image can't render
const isPhoto = (image: IImage) => Boolean(image.mime?.startsWith("image/"));

/**
 * Fetch conferences, newest first, with optional pagination. `images` only holds photos and has no
 * blur placeholders: add them to the rendered conferences with `withCoverPlaceholders`.
 */
export async function getAllConferences(start?: number, limit?: number) {
  const baseQuery = {
    sort: { date: "desc" },
    populate: "images",
  };

  const query =
    start !== undefined && limit !== undefined
      ? { ...baseQuery, pagination: { start, limit } }
      : baseQuery;

  const response = await fetchAPI<IStrapiCollectionResponse<IStrapiConference>>(
    "/conferences",
    query,
    {
      tags: ["conferences"],
    },
  );

  return {
    ...response,
    data: response.data.map((conference) => ({
      ...conference,
      images: conference.images.filter(isPhoto),
    })),
  };
}

/**
 * Number of conferences, without loading any images (sitemap, generateStaticParams).
 */
export async function getConferenceCount(): Promise<number> {
  const response = await fetchAPI<IStrapiCollectionResponse<Pick<IStrapiConference, "date">>>(
    "/conferences",
    { fields: ["date"], pagination: { start: 0, limit: 1 } },
    { tags: ["conferences"] },
  );
  return response.meta.pagination.total;
}

/**
 * Adds a blur placeholder to the first photo of each conference: the only one visible until the
 * card's gallery is used.
 */
export function withCoverPlaceholders(
  conferences: IStrapiConference[],
): Promise<IStrapiConference[]> {
  return Promise.all(
    conferences.map(async (conference) => {
      const [cover, ...rest] = conference.images;
      const blurDataURL = cover && (await getStrapiBlurDataURL(cover));
      return cover && blurDataURL
        ? { ...conference, images: [{ ...cover, blurDataURL }, ...rest] }
        : conference;
    }),
  );
}
