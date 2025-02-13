import { redirect } from "next/navigation";

export async function GET() {
  redirect("/blog/1");
}
