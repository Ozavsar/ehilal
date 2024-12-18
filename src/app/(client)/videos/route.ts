import { redirect } from "next/navigation";

export async function GET() {
  redirect("/videos/1");
}
