import { Metadata } from "next";
import ConferencesContainer from "@/containers/conferences";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { fetchConferences } from "@/lib/services/conferences";
import { getPageTitle } from "@/lib/services/pages";

export const metadata: Metadata = {
  title: "Conferences",
};

export default async function Conferences({
  params,
}: {
  params: { slug: string };
}) {
  const pageContent = await getPageTitle("conferences-page");
  const start = ITEMS_PER_PAGE * (Number(params.slug) - 1);
  const response = await fetchConferences(start, ITEMS_PER_PAGE);
  const totalPages = Math.ceil(response.meta.pagination.total / ITEMS_PER_PAGE);

  return (
    <ConferencesContainer
      conferences={response.data}
      pageNumber={params.slug}
      content={pageContent}
      totalPages={totalPages}
    />
  );
}

export async function generateStaticParams() {
  const response = await fetchConferences(0, 1);
  if (!response || !response.data.length) return [];
  const totalConferences = response.meta.pagination.total;
  const totalPages = Math.ceil(totalConferences / ITEMS_PER_PAGE);

  return Array.from({ length: totalPages }, (_, i) => ({
    page: (i + 1).toString(),
  }));
}
