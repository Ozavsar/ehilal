import { cache } from "react";
import { notFound } from "next/navigation";
import ConferencesContainer from "@/containers/conferences";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllConferences } from "@/lib/services/conferences";
import { buildMeta } from "@/lib/metadata";
import { Metadata } from "next";

export const dynamicParams = true;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ehilal.net";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Elif Hilal Kara";

// Canonical positive integers only: rejects "abc", "1abc", "01", "0"
const PAGE_PARAM_PATTERN = /^[1-9]\d*$/;

// Shared by the page and generateMetadata so image placeholders are built once per request
// (and not at all for out-of-range pages, which return no data)
const getConferencesPage = cache((pageNum: number) =>
  getAllConferences(ITEMS_PER_PAGE * (pageNum - 1), ITEMS_PER_PAGE),
);

export default async function ConferencesPage(props: { params: Promise<{ page: string }> }) {
  const { page } = await props.params;

  if (!PAGE_PARAM_PATTERN.test(page)) {
    notFound();
  }

  const pageNum = Number(page);

  let response: Awaited<ReturnType<typeof getConferencesPage>> | undefined;
  try {
    response = await getConferencesPage(pageNum);
  } catch (error) {
    console.error("Error in Conferences page:", error);
  }

  if (!response?.data) {
    notFound();
  }

  const totalPages = Math.ceil(response.meta.pagination.total / ITEMS_PER_PAGE);

  if (pageNum > totalPages) {
    notFound();
  }

  return (
    <ConferencesContainer
      conferences={response.data}
      pageNumber={pageNum.toString()}
      totalPages={totalPages}
    />
  );
}

export async function generateStaticParams() {
  try {
    const response = await getAllConferences(0, 1);

    if (!response || !response.data.length) {
      return [{ page: "1" }];
    }

    const totalPages = Math.ceil(response.meta.pagination.total / ITEMS_PER_PAGE);

    return Array.from({ length: totalPages }, (_, i) => ({
      page: (i + 1).toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [{ page: "1" }];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  try {
    const { page } = await params;
    const pageNum = Number(page);

    if (!PAGE_PARAM_PATTERN.test(page)) {
      return buildMeta({
        title: "Page Not Found",
        description: "Invalid conferences page number.",
        path: "/conferences",
      });
    }

    const response = await getConferencesPage(pageNum);
    if (!response || !response.meta?.pagination?.total) {
      return buildMeta({
        title: "Conferences",
        description: `Explore the conferences and talks by ${SITE_NAME}.`,
        path: "/conferences",
      });
    }

    const totalPages = Math.ceil(response.meta.pagination.total / ITEMS_PER_PAGE);

    if (pageNum > totalPages) {
      return buildMeta({
        title: "Page Not Found",
        description: "Requested page exceeds available conference listings.",
        path: "/conferences",
      });
    }

    const title = pageNum > 1 ? `Conferences – Page ${pageNum}` : "Conferences & Talks";
    const description =
      pageNum > 1
        ? `Explore the conferences and talks attended by ${SITE_NAME} — page ${pageNum}.`
        : `Explore all conferences, panels, and events where ${SITE_NAME} has spoken or participated.`;

    return buildMeta({
      title,
      description,
      path: `/conferences${pageNum > 1 ? `/${pageNum}` : ""}`,
      type: "website",
      image: {
        url: `${SITE_URL}/api/og?title=${encodeURIComponent(title)}`,
        alt: `Conferences and Talks by ${SITE_NAME}`,
      },
    });
  } catch (error) {
    console.error("Error generating metadata for Conferences:", error);
    return buildMeta({
      title: "Conferences",
      description: `Explore the conferences and talks by ${SITE_NAME}.`,
      path: "/conferences",
    });
  }
}
