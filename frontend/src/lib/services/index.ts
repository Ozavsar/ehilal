import { IStrapiResponse, IStrapiTheme } from "@/types";
import { fetchAPI } from "../api/fetchAPI";

export async function fetchTheme() {
  const response = await fetchAPI<IStrapiResponse<IStrapiTheme>>(
    "/theme",
    {},
    { tags: ["pages"] },
  );

  return response.data;
}
