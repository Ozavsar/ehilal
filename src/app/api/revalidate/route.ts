import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const revalidateKey = searchParams.get("revalidateKey");

  if (revalidateKey !== process.env.REVALIDATE_KEY) {
    return { status: 401, body: "Unauthorized" };
  }

  revalidatePath("/blog");
  revalidatePath("/videos");
}
