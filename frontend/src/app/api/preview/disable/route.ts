import { draftMode } from "next/headers";

// Leaves Draft Mode. POST so link prefetching can't trigger it; 303 turns the follow-up into a GET.
export async function POST() {
  (await draftMode()).disable();
  return new Response(null, { status: 303, headers: { Location: "/" } });
}
