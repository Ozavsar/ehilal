import { redirect } from "next/navigation";

export async function GET() {
  redirect("/courses/1");
}
