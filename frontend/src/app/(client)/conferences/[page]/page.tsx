import { notFound } from "next/navigation";
import ConferencesContainer from "@/containers/conferences";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllConferences } from "@/lib/services/conferences";
import { buildMeta } from "@/lib/metadata";
import { Metadata } from "next";

export const dynamicParams = true;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ehilal.net";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Elif Hilal Kara";

export default async function ConferencesPage(props: {
  params: Promise<{ page: string }>;
}) {
  const params = await props.params;
  const pageNum = parseInt(params.page ?? "1", 10);

  if (isNaN(pageNum) || pageNum <= 0) {
    return notFound();
  }

  const start = ITEMS_PER_PAGE * (pageNum - 1);

  try {
    const response = await getAllConferences(start, ITEMS_PER_PAGE);

    if (!response || !response.data) {
      return notFound();
    }

    const totalPages = Math.ceil(
      response.meta.pagination.total / ITEMS_PER_PAGE,
    );

    if (pageNum > totalPages) {
      return notFound();
    }

    return (
      <ConferencesContainer
        conferences={response.data}
        pageNumber={pageNum.toString()}
        totalPages={totalPages}
      />
    );
  } catch (error) {
    console.error("Error in Conferences page:", error);
    return notFound();
  }
}

export async function generateStaticParams() {
  try {
    const response = await getAllConferences(0, 1);

    if (!response || !response.data.length) {
      return [{ page: "1" }];
    }

    const totalPages = Math.ceil(
      response.meta.pagination.total / ITEMS_PER_PAGE,
    );

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
    const pageNum = parseInt(page ?? "1", 10);

    if (isNaN(pageNum) || pageNum <= 0) {
      return buildMeta({
        title: "Page Not Found",
        description: "Invalid conferences page number.",
        path: "/conferences",
      });
    }

    const response = await getAllConferences(0, ITEMS_PER_PAGE);
    if (!response || !response.meta?.pagination?.total) {
      return buildMeta({
        title: "Conferences",
        description: `Explore the conferences and talks by ${SITE_NAME}.`,
        path: "/conferences",
      });
    }

    const totalPages = Math.ceil(
      response.meta.pagination.total / ITEMS_PER_PAGE,
    );

    if (pageNum > totalPages) {
      return buildMeta({
        title: "Page Not Found",
        description: "Requested page exceeds available conference listings.",
        path: "/conferences",
      });
    }

    const title =
      pageNum > 1 ? `Conferences – Page ${pageNum}` : "Conferences & Talks";
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
