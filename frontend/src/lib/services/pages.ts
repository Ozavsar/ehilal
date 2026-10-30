import { fetchAPI } from "../api/fetchAPI";
import type {
  IStrapiContactPage,
  IStrapiHomePage,
  IStrapiResponse,
  IPageTitle,
  INotFoundPage,
} from "@/types";

// Each request names the fields it renders (Strapi adds id and documentId). Page titles,
// descriptions and social copy come from config/seo.ts, not from Strapi.
const PAGE_TITLE_FIELDS = ["page_title", "page_title_background", "updatedAt"];

/**
 * Get home page content
 */
export async function getHomePageContent() {
  const response = await fetchAPI<IStrapiResponse<IStrapiHomePage>>(
    "/home-page",
    { fields: ["greeting", "introduction", "updatedAt"], populate: "hero_image" },
    { tags: ["home-title"] },
  );
  return response.data;
}

/**
 * Get contact page content
 */
export async function getContactPageContent() {
  const response = await fetchAPI<IStrapiResponse<IStrapiContactPage>>(
    "/contact-page",
    { fields: [...PAGE_TITLE_FIELDS, "title", "description", "form_recipient_email"] },
    {
      tags: ["contact-title"],
    },
  );
  return response.data;
}

/**
 * Get page titles by page name
 */
export async function getPageTitle(pageName: string, tags?: string[]) {
  const response = await fetchAPI<IStrapiResponse<IPageTitle>>(
    `/${pageName}`,
    { fields: PAGE_TITLE_FIELDS },
    {
      tags,
    },
  );
  return response.data;
}

/**
 * Get Not Found page content
 */
export async function getNotFoundPageContent() {
  const response = await fetchAPI<IStrapiResponse<INotFoundPage>>(
    "/not-found-page",
    { fields: ["updatedAt"], populate: "image" },
    { tags: ["not-title"] },
  );
  return response.data;
}
