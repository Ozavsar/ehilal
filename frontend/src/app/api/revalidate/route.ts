import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { env } from "@/config/env";

const sha256 = (value: string) => createHash("sha256").update(value).digest();

// Strapi model (the webhook's `model`) → the fetch cache tags its content is stored under.
// Keep in sync with the `tags` passed in lib/services and the getPageTitle() calls in the (client) layouts.
const MODEL_TAGS: Record<string, string[]> = {
  video: ["videos"],
  conference: ["conferences"],
  "social-media-link": ["social-media-links"],
  theme: ["theme"],
  "home-page": ["home-title"],
  "contact-page": ["contact-title"],
  "not-found-page": ["not-title"],
  "blog-page": ["blog-title"],
  "conferences-page": ["conferences-title"],
  "courses-page": ["courses-title"],
  "videos-page": ["videos-title"],
};

// Hashing both sides gives equal-length buffers, so timingSafeEqual never throws on a length mismatch
function isValidKey(providedKey: string | null) {
  const expectedKey = env.REVALIDATE_KEY;
  if (!expectedKey) {
    console.error("REVALIDATE_KEY is not set; rejecting revalidation request");
    return false;
  }
  if (!providedKey) return false;
  return timingSafeEqual(sha256(providedKey), sha256(expectedKey));
}

export async function POST(req: NextRequest) {
  try {
    if (!isValidKey(req.headers.get("Revalidation-Key"))) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json().catch(() => null);
    const model = body && typeof body === "object" && "model" in body ? body.model : undefined;

    const tags =
      typeof model === "string" && Object.hasOwn(MODEL_TAGS, model) ? MODEL_TAGS[model] : null;
    if (!tags) {
      return NextResponse.json({ message: "Invalid model" }, { status: 400 });
    }

    for (const tag of tags) {
      revalidateTag(tag, "max");
    }

    return NextResponse.json({ revalidated: true, tags, now: Date.now() });
  } catch (error) {
    console.error("Revalidation failed:", error);
    return NextResponse.json({ message: "Revalidation failed" }, { status: 500 });
  }
}
