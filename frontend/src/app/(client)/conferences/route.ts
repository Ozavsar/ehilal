import { redirect } from "next/navigation";

export async function GET() {
  redirect("/conferences/1");
}
