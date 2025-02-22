import { IStrapiResponse, IStrapiSocialLinks, IStrapiTheme } from "@/types";
import { fetchAPI } from "../api/fetchAPI";

/**
 * get the theme data from the Strapi API.
 */

export async function getTheme() {
  const response = await fetchAPI<IStrapiResponse<IStrapiTheme>>("/theme");
  console.log("theme fetched");
  return response.data;
}

/**
 * Get Social Media Links
 */
export async function getSocialMediaLinks() {
  const response =
    await fetchAPI<IStrapiResponse<IStrapiSocialLinks>>("/social-media-link");
  console.log("social media links fetched");

  return response.data;
}
