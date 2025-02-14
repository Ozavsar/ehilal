import { fetchAPI } from "../api/fetchAPI";
import type {
  IStrapiContactPage,
  IStrapiHomePage,
  IStrapiResponse,
  IPageTitle,
} from "@/types.d";

/**
 * Get home page content
 */
export async function getHomePageContent() {
  const response = await fetchAPI<IStrapiResponse<IStrapiHomePage>>(
    "/home-page",
    { populate: "hero_image" },
    { tags: ["pages"] },
  );
  return response.data;
}

/**
 * Get contact page content
 */
export async function getContactPageContent() {
  const response = await fetchAPI<IStrapiResponse<IStrapiContactPage>>(
    "/contact-page",
    {},
    { tags: ["pages"] },
  );
  return response.data;
}

/**
 * Get page titles by page name
 */
export async function getPageTitle(pageName: string) {
  const response = await fetchAPI<IStrapiResponse<IPageTitle>>(
    `/${pageName}`,
    {},
    {
      tags: ["pages"],
    },
  );
  return response.data;
}
