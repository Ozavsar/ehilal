import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

const sha256 = (value: string) => createHash("sha256").update(value).digest();

// Hashing both sides gives equal-length buffers, so timingSafeEqual never throws on a length mismatch
function isValidKey(providedKey: string | null) {
  const expectedKey = process.env.REVALIDATE_KEY;
  if (!expectedKey) {
    console.error("❌ REVALIDATE_KEY is not set; rejecting revalidation request");
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

    if (typeof model !== "string" || !model) {
      return NextResponse.json({ message: "Invalid model" }, { status: 400 });
    }

    // console.log("revalidating model: ", model);

    if (model === "video") {
      revalidateTag("videos", "max");
    } else if (model === "conference") {
      revalidateTag("conferences", "max");
    } else if (model === "social-media-link") {
      revalidateTag("social-media-links", "max");
    } else if (model === "theme") {
      revalidateTag("theme", "max");
    } else if (model.includes("-page")) {
      revalidateTag(`${model.split("-")[0]}-title`, "max");
    } else {
      return NextResponse.json({ message: "Invalid model" }, { status: 400 });
    }

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    console.error("❌ Revalidation failed:", error);
    return NextResponse.json({ message: "Revalidation failed" }, { status: 500 });
  }
}
