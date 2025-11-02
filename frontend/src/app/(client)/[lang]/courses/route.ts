import { redirect } from "next/navigation";

export async function GET() {
  redirect("/en/courses/1");
}
