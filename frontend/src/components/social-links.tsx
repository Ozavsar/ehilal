import type { ReactNode } from "react";
import { getSiteSettings, getSocialMediaLinks } from "@/lib/services";
import { buttonVariants } from "@/components/ui/button";
import { BrandIcon } from "@/components/brand-icon";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import LegalifiLogomark from "./assets/legalifi-logomark";

export default async function SocialLinks() {
  const [socialLinks, site] = await Promise.all([getSocialMediaLinks(), getSiteSettings()]);
  // Links not filled in Strapi are skipped instead of rendering a dead "#" link
  const socialLinkContents: { href: string | null | undefined; icon: ReactNode; title: string }[] =
    [
      { href: socialLinks.twitter_x, icon: <BrandIcon brand="x" />, title: "X" },
      { href: socialLinks.linkedin, icon: <BrandIcon brand="linkedin" />, title: "LinkedIn" },
      { href: socialLinks.youtube, icon: <BrandIcon brand="youtube" />, title: "YouTube" },
      { href: socialLinks.instagram, icon: <BrandIcon brand="instagram" />, title: "Instagram" },
      { href: socialLinks.medium, icon: <BrandIcon brand="medium" />, title: "Medium" },
      { href: socialLinks.substack, icon: <BrandIcon brand="substack" />, title: "Substack" },
      { href: socialLinks.udemy, icon: <BrandIcon brand="udemy" />, title: "Udemy" },
      { href: site.karakodUrl, icon: <Icon name="language" />, title: "Karakod" },
      {
        href: site.legalifiUrl,
        icon: <LegalifiLogomark aria-hidden="true" />,
        title: "Legalifi",
      },
    ];

  return (
    <ul className="flex flex-wrap justify-center gap-2 self-center">
      {socialLinkContents.flatMap(({ href, icon, title }) =>
        href
          ? [
              <li key={title}>
                <a
                  href={href}
                  aria-label={`${title} (opens in a new tab)`}
                  title={title}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "text-on-surface-variant",
                  )}
                >
                  {icon}
                </a>
              </li>,
            ]
          : [],
      )}
    </ul>
  );
}
