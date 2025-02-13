import { fetchAPI } from "../api/fetchAPI";
import type {
  IStrapiContactPage,
  IStrapiHomePage,
  IStrapiResponse,
} from "@/types.d";

/**
 * Get home page content
 */
export async function getHomePageContent() {
  const response = await fetchAPI<IStrapiResponse<IStrapiHomePage>>(
    "/home-page",
    {},
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
