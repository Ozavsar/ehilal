import { IStrapiResponse, IStrapiSocialLinks, IStrapiTheme } from "@/types";
import { fetchAPI } from "../api/fetchAPI";

/**
 * Fetches the theme data from the Strapi API.
 */

export async function fetchTheme() {
  const response = await fetchAPI<IStrapiResponse<IStrapiTheme>>(
    "/theme",
    {},
    { tags: ["pages"] },
  );

  return response.data;
}

/**
 * Get Social Media Links
 */
export async function getSocialMediaLinks() {
  const response = await fetchAPI<IStrapiResponse<IStrapiSocialLinks>>(
    "/social-media-link",
    {},
    { tags: ["pages"] },
  );

  return response.data;
}
