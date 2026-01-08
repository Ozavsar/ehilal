import { LuLinkedin, LuYoutube } from "react-icons/lu";
import { BsTwitterX } from "react-icons/bs";
import { getSocialMediaLinks } from "@/lib/services";
import { COMPANY_LINKEDIN_URL } from "@/config/constants";

export default async function SocialLinks() {
  const socialLinks = await getSocialMediaLinks();
  const socialLinkContents = [
    {
      href: socialLinks.twitter_x || "#",
      icon: BsTwitterX,
    },
    {
      href: socialLinks.linkedin || "#",
      icon: LuLinkedin,
    },
    {
      href: socialLinks.youtube || "#",
      icon: LuYoutube,
    },
  ];
  return (
    <div className="flex gap-4 self-center">
      {socialLinkContents.map(({ href, icon: Icon }) => (
        <a
          key={href}
          href={href}
          role="button"
          aria-label={href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-primary p-2 text-primary transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white active:scale-95"
        >
          <Icon className="size-5 sm:size-6" />
        </a>
      ))}
      <a
        href={COMPANY_LINKEDIN_URL}
        role="button"
        aria-label={COMPANY_LINKEDIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-primary p-2 text-primary transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white active:scale-95"
      >
        <LuLinkedin className="size-5 sm:size-6" />
      </a>
    </div>
  );
}
