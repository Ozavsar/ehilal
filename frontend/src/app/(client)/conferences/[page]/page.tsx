import { cache } from "react";
import { notFound } from "next/navigation";
import ConferencesContainer from "@/containers/conferences";
import { ITEMS_PER_PAGE } from "@/config/constants";
import {
  getAllConferences,
  getConferenceCount,
  withCoverPlaceholders,
} from "@/lib/services/conferences";
import { buildMeta } from "@/lib/metadata";
import { SITE_URL } from "@/config/site";
import { getSiteSettings } from "@/lib/services";
import { Metadata } from "next";

export const dynamicParams = true;

// Canonical positive integers only: rejects "abc", "1abc", "01", "0"
const PAGE_PARAM_PATTERN = /^[1-9]\d*$/;

// Shared by the page and generateMetadata: one Strapi request per render
const getConferencesPage = cache((pageNum: number) =>
  getAllConferences(ITEMS_PER_PAGE * (pageNum - 1), ITEMS_PER_PAGE),
);

/**
 * The requested page, or notFound() for invalid and out-of-range pages.
 * Strapi failures propagate to error.tsx, so ISR keeps the last good version instead of caching a 404.
 */
async function getPageOrNotFound(page: string) {
  if (!PAGE_PARAM_PATTERN.test(page)) {
    notFound();
  }

  const pageNum = Number(page);
  const response = await getConferencesPage(pageNum);
  const totalPages = Math.ceil(response.meta.pagination.total / ITEMS_PER_PAGE);

  if (!response.data.length || pageNum > totalPages) {
    notFound();
  }

  return { conferences: response.data, pageNum, totalPages };
}

export default async function ConferencesPage(props: { params: Promise<{ page: string }> }) {
  const { page } = await props.params;
  const { conferences, pageNum, totalPages } = await getPageOrNotFound(page);

  // Placeholders only for the cover photo of the conferences on this page
  const pageConferences = await withCoverPlaceholders(conferences);

  return (
    <ConferencesContainer
      conferences={pageConferences}
      pageNumber={pageNum.toString()}
      totalPages={totalPages}
    />
  );
}

export async function generateStaticParams() {
  try {
    const totalPages = Math.ceil((await getConferenceCount()) / ITEMS_PER_PAGE);

    return Array.from({ length: totalPages }, (_, i) => ({
      page: (i + 1).toString(),
    }));
  } catch (error) {
    // Don't fail the build: pages are rendered on demand instead (dynamicParams)
    console.error("Conference pages could not be listed for prerendering:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const { pageNum } = await getPageOrNotFound(page);
  const { siteName } = await getSiteSettings();

  const title = pageNum > 1 ? `Conferences – Page ${pageNum}` : "Conferences & Talks";
  const description =
    pageNum > 1
      ? `Explore the conferences and talks attended by ${siteName} — page ${pageNum}.`
      : `Explore all conferences, panels, and events where ${siteName} has spoken or participated.`;

  return buildMeta({
    title,
    description,
    path: `/conferences${pageNum > 1 ? `/${pageNum}` : ""}`,
    type: "website",
    image: {
      url: `${SITE_URL}/api/og?title=${encodeURIComponent(title)}`,
      alt: `Conferences and Talks by ${siteName}`,
    },
  });
}
