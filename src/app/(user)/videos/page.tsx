import VideosContainer from "@/containers/videos";

export default function Videos({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  return <VideosContainer searchParams={searchParams} />;
}
