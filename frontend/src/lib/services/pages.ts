import { fetchAPI } from "../api/fetchAPI";
import type {
  IStrapiContactPage,
  IStrapiHomePage,
  IStrapiResponse,
  IPageTitle,
  INotFoundPage,
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

/**
 * Get Not Found page content
 */
export async function getNotFoundPageContent() {
  const response = await fetchAPI<IStrapiResponse<INotFoundPage>>(
    "/not-found-page",
    { populate: "image" },
  );
  return response.data;
}
