import { fetchAPI } from "../api/fetchAPI";
import type {
  IStrapiContactPage,
  IStrapiHomePage,
  IStrapiResponse,
} from "@/types.d";

/**
 * Get home page content
 */
export async function getHomePageContent(): Promise<IStrapiHomePage> {
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
export async function getContactPageContent(): Promise<IStrapiContactPage> {
  const response = await fetchAPI<IStrapiResponse<IStrapiContactPage>>(
    "/contact-page",
    {},
    { tags: ["pages"] },
  );
  return response.data;
}
