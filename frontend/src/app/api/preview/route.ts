import { createHash, timingSafeEqual } from "node:crypto";
import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";

const sha256 = (value: string) => createHash("sha256").update(value).digest();

// Hashing both sides gives equal-length buffers, so timingSafeEqual never throws on a length mismatch
function isValidSecret(provided: string | null) {
  const expected = env.PREVIEW_SECRET;
  if (!expected) {
    console.error("PREVIEW_SECRET is not set; rejecting preview request");
    return false;
  }
  if (!provided) return false;
  return timingSafeEqual(sha256(provided), sha256(expected));
}

// Same-site paths only ("/x", not "//host" or "/\host"), so the route can't be used as an open redirect
const isRelativePath = (url: string | null): url is string =>
  !!url && url.startsWith("/") && !url.startsWith("//") && !url.startsWith("/\\");

/**
 * Strapi Preview entry point: `/api/preview?secret=…&status=draft|published&url=/theme-preview`.
 * `draft` turns Draft Mode on (the site reads draft content, e.g. the unpublished theme palette, for
 * this browser only); `published` turns it off. Then redirects to `url`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  if (!isValidSecret(searchParams.get("secret"))) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  const url = searchParams.get("url") ?? "/";
  if (!isRelativePath(url)) {
    return NextResponse.json({ message: "Invalid url" }, { status: 400 });
  }

  const draft = await draftMode();
  if (searchParams.get("status") === "published") {
    draft.disable();
  } else {
    draft.enable();
  }

  // Relative Location: request.url carries the internal host behind the proxy
  return new Response(null, { status: 307, headers: { Location: url } });
}
