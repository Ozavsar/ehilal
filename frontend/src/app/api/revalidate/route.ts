import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// @todo: Add body type control after docs added to the project
export async function POST(req: NextRequest) {
  try {
    if (req.headers.get("Revalidation-Key") !== process.env.REVALIDATE_KEY) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    revalidateTag("pages");

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
