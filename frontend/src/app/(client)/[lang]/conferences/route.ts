import { redirect } from "next/navigation";

export async function GET() {
  redirect("/en/conferences/1");
}
