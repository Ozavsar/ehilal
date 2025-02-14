import { getSocialMediaLinks } from "@/lib/services";

export async function SocialLinks() {
  const socialLinks = await getSocialMediaLinks();
  console.log(socialLinks);
  return socialLinks;
}
