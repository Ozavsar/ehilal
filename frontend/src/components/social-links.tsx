import { unstable_cache } from "next/cache";
import { LuLinkedin } from "react-icons/lu";
import { BsTwitterX } from "react-icons/bs";
import { Button } from "./ui/button";
import { getSocialMediaLinks } from "@/lib/services";

export const getCachedSocialMediaLinks = unstable_cache(
  getSocialMediaLinks,
  ["social-media-links"],
  {
    tags: ["social-media-links"],
  },
);

export default async function SocialLinks() {
  const socialLinks = await getCachedSocialMediaLinks();
  const socialLinkContents = [
    {
      href: socialLinks.twitter_x,
      icon: BsTwitterX,
    },
    {
      href: socialLinks.linkedin,
      icon: LuLinkedin,
    },
  ];
  return (
    <div className="flex gap-2 sm:gap-4">
      {socialLinkContents.map(({ href, icon: Icon }) => (
        <a key={href} href={href} target="_blank" rel="noopener noreferrer">
          <Button
            key={href}
            aria-label={href}
            className="size-14 border border-primary text-primary hover:text-foreground"
            variant="circle"
          >
            <Icon size={24} />
          </Button>
        </a>
      ))}
    </div>
  );
}
