import { IStrapiBasePage, IStrapiConference, IStrapiResponse } from "@/types";
import { fetchAPI } from "../api/fetchAPI";

/**
 * Fetch all conferences with optional pagination.
 */
export async function fetchConferences(
  start?: number,
  limit?: number,
): Promise<IStrapiResponse<IStrapiConference[]>> {
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
    { tags: ["pages"] },
  );

  return response;
}
