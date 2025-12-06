import { IStrapiResponse, IStrapiSocialLinks, IStrapiTheme } from "@/types";
import { fetchAPI } from "../api/fetchAPI";

/**
 * get the theme data from the Strapi API.
 */

export async function getTheme() {
  const response = await fetchAPI<IStrapiResponse<IStrapiTheme>>(
    "/theme",
    {},
    {
      tags: ["theme"],
    },
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
    {
      tags: ["social-media-links"],
    },
  );

  return response.data;
}
