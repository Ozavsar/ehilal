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
  );
  return response.data;
}

/**
 * Get contact page content
 */
export async function getContactPageContent() {
  const response =
    await fetchAPI<IStrapiResponse<IStrapiContactPage>>("/contact-page");
  console.log("contact page content fetched");
  return response.data;
}

/**
 * Get page titles by page name
 */
export async function getPageTitle(pageName: string) {
  const response = await fetchAPI<IStrapiResponse<IPageTitle>>(`/${pageName}`);
  console.log(pageName + " title fetched");
  return response.data;
}
