import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import ConferencesContainer from "@/containers/conferences";
import { ITEMS_PER_PAGE } from "@/config/constants";
import { getAllConferences } from "@/lib/services/conferences";

export const dynamicParams = true;

const getCachedConferences = unstable_cache(
  async (start: number, limit: number) => {
    try {
      return await getAllConferences(start, limit);
    } catch (error) {
      console.error("Error fetching conferences:", error);
      return { data: [], meta: { pagination: { total: 0 } } };
    }
  },
  ["conferences-list"],
  {
    tags: ["conferences"],
  },
);

export default async function ConferencesPage(
  props: {
    params: Promise<{ page: string }>;
  }
) {
  const params = await props.params;
  const pageNum = parseInt(params.page ?? "1", 10);

  if (isNaN(pageNum) || pageNum <= 0) {
    return notFound();
  }

  const start = ITEMS_PER_PAGE * (pageNum - 1);

  try {
    const response = await getCachedConferences(start, ITEMS_PER_PAGE);

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
    const response = await getCachedConferences(0, 1);

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
