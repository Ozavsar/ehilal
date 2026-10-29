import { LuGlobe, LuLinkedin, LuYoutube } from "react-icons/lu";
import { BsInstagram, BsTwitterX } from "react-icons/bs";
import { getSocialMediaLinks } from "@/lib/services";
import { COMPANY_URL, LEGALIFI_URL } from "@/config/constants";
import LegalifiLogomark from "./assets/legalifi-logomark";

export default async function SocialLinks() {
  const socialLinks = await getSocialMediaLinks();
  const socialLinkContents = [
    {
      href: socialLinks.twitter_x || "#",
      icon: BsTwitterX,
      title: "Twitter",
    },
    {
      href: socialLinks.linkedin || "#",
      icon: LuLinkedin,
      title: "LinkedIn",
    },
    {
      href: socialLinks.youtube || "#",
      icon: LuYoutube,
      title: "YouTube",
    },
    // Optional in Strapi: only rendered once a URL has been entered
    ...(socialLinks.instagram
      ? [{ href: socialLinks.instagram, icon: BsInstagram, title: "Instagram" }]
      : []),
    { href: COMPANY_URL, icon: LuGlobe, title: "Karakod" },
    {
      href: LEGALIFI_URL,
      icon: LegalifiLogomark,
      title: "Legalifi",
    },
  ];
  return (
    <div className="flex flex-wrap justify-center gap-4 self-center">
      {socialLinkContents.map(({ href, icon: Icon, title }) => (
        <a
          key={href}
          href={href}
          role="button"
          aria-label={href}
          title={title}
          target="_blank"
          rel="noopener noreferrer"
          className="border-primary text-primary hover:bg-primary rounded-full border p-2 transition-all duration-300 hover:text-white active:scale-95"
        >
          <Icon className="size-5 sm:size-6" />
        </a>
      ))}
    </div>
  );
}
