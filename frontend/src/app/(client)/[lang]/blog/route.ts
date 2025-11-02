import { redirect } from "next/navigation";

export async function GET() {
  redirect("/en/blog/1");
}
