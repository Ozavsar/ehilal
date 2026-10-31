import { fetchAPI } from "../api/fetchAPI";
import { getStrapiBlurDataURL } from "../getImage";
import type { IImage, IStrapiCollectionResponse, IStrapiConference } from "@/types";

// The media field may hold non-image uploads, which next/image can't render
const isPhoto = (image: IImage) => Boolean(image.mime?.startsWith("image/"));

/** Conferences, newest first. `images` holds photos only, without blur placeholders. */
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

export async function getConferenceCount(): Promise<number> {
  const response = await fetchAPI<IStrapiCollectionResponse<Pick<IStrapiConference, "date">>>(
    "/conferences",
    { fields: ["date"], pagination: { start: 0, limit: 1 } },
    { tags: ["conferences"] },
  );
  return response.meta.pagination.total;
}

/** Blur placeholder for each conference's first photo, the only one visible before the gallery */
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
