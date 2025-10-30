import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// @todo: Add body type control after docs added to the project
export async function POST(req: NextRequest) {
  try {
    if (req.headers.get("Revalidation-Key") !== process.env.REVALIDATE_KEY) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { model } = await req.json();

    console.log("revalidating model: ", model);

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
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
