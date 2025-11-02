import { redirect } from "next/navigation";

export async function GET() {
  redirect("/en/videos/1");
}
