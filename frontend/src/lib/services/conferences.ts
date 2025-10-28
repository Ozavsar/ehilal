import { fetchAPI } from "../api/fetchAPI";
import type { IStrapiConference, IStrapiResponse } from "@/types.d";
import { getImage } from "../getImage";

/**
 * Fetch all conferences with optional pagination.
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

  const response = await fetchAPI<IStrapiResponse<IStrapiConference[]>>(
    "/conferences",
    query,
  );

  const dataWithPlaceholders = await Promise.all(
    response.data.map(async (conference) => {
      const imagesWithPlaceholders = await Promise.all(
        conference.images.map(async (image) => {
          try {
            const placeholder = await getImage(image.url);
            return { ...image, blurDataURL: placeholder.base64 };
          } catch (error) {
            console.error(`Failed to get placeholder for ${image.url}`, error);
            return { ...image, blurDataURL: undefined };
          }
        }),
      );

      return {
        ...conference,
        images: imagesWithPlaceholders,
      };
    }),
  );

  return {
    ...response,
    data: dataWithPlaceholders,
  };
}
