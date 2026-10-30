import { LuGlobe, LuLinkedin, LuYoutube } from "react-icons/lu";
import { BsInstagram, BsTwitterX } from "react-icons/bs";
import { getSocialMediaLinks } from "@/lib/services";
import { COMPANY_URL, LEGALIFI_URL } from "@/config/constants";
import LegalifiLogomark from "./assets/legalifi-logomark";

export default async function SocialLinks() {
  const socialLinks = await getSocialMediaLinks();
  // Links not filled in Strapi are skipped instead of rendering a dead "#" link
  const socialLinkContents = [
    { href: socialLinks.twitter_x, icon: BsTwitterX, title: "Twitter" },
    { href: socialLinks.linkedin, icon: LuLinkedin, title: "LinkedIn" },
    { href: socialLinks.youtube, icon: LuYoutube, title: "YouTube" },
    { href: socialLinks.instagram, icon: BsInstagram, title: "Instagram" },
    { href: COMPANY_URL, icon: LuGlobe, title: "Karakod" },
    { href: LEGALIFI_URL, icon: LegalifiLogomark, title: "Legalifi" },
  ].flatMap(({ href, ...link }) => (href ? [{ href, ...link }] : []));
  return (
    <div className="flex flex-wrap justify-center gap-4 self-center">
      {socialLinkContents.map(({ href, icon: Icon, title }) => (
        <a
          key={title}
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
