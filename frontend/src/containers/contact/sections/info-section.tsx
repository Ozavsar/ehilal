import Link from "next/link";
import type { ReactNode } from "react";
import { YOUTUBE_CHANNEL_HANDLE } from "@/config/constants";
import { BrandIcon } from "@/components/brand-icon";
import { Icon } from "@/components/icon";
import MotionGrid from "@/components/motion-grid";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface IInfoSectionProps {
  className?: string;
  socialMediaLinks: {
    email: string;
    twitter_x: string;
    linkedin: string;
    youtube: string;
    instagram?: string | null;
  };
  companyLinkedinUrl: string;
}

// CMS URLs may end with "/", lack "www" or carry a query string (?igsh=...), so parse them.
// [] for empty or invalid URLs.
function getPathSegments(url: string | null | undefined): string[] {
  if (!url) return [];
  try {
    return new URL(url).pathname.split("/").filter(Boolean);
  } catch {
    return [];
  }
}

const toHandle = (segment: string | undefined) =>
  segment ? `@${segment.replace(/^@/, "")}` : undefined;

// The contact channels as an M3 list in a card, stretched to the height of the form beside it
export default function InfoSection({
  socialMediaLinks,
  companyLinkedinUrl,
  className,
}: IInfoSectionProps) {
  const youtubeHandle = getPathSegments(socialMediaLinks.youtube).find((s) => s.startsWith("@"));

  // Links not filled in Strapi (e.g. the optional Instagram) are skipped
  const links: {
    href: string;
    icon: ReactNode;
    title: string;
    label: string;
    lowercase: boolean;
  }[] = [
    {
      href: socialMediaLinks.email && `mailto:${socialMediaLinks.email}`,
      icon: <Icon name="mail" size={20} />,
      title: "Mail Me",
      label: socialMediaLinks.email,
      lowercase: true,
    },
    {
      href: socialMediaLinks.twitter_x,
      icon: <BrandIcon brand="x" size={20} />,
      title: "Follow Me",
      label: toHandle(getPathSegments(socialMediaLinks.twitter_x)[0]) ?? "X (Twitter)",
      lowercase: true,
    },
    {
      href: socialMediaLinks.linkedin,
      icon: <BrandIcon brand="linkedin" size={20} />,
      title: "Connect with Me",
      // linkedin.com/in/<name>
      label: getPathSegments(socialMediaLinks.linkedin).at(-1)?.replace(/-/g, " ") ?? "LinkedIn",
      lowercase: false,
    },
    {
      href: socialMediaLinks.youtube || `https://www.youtube.com/${YOUTUBE_CHANNEL_HANDLE}`,
      icon: <BrandIcon brand="youtube" size={20} />,
      title: "Subscribe",
      label: youtubeHandle ?? YOUTUBE_CHANNEL_HANDLE,
      lowercase: true,
    },
    {
      href: socialMediaLinks.instagram ?? "",
      icon: <BrandIcon brand="instagram" size={20} />,
      title: "Follow on Instagram",
      label: toHandle(getPathSegments(socialMediaLinks.instagram)[0]) ?? "Instagram",
      lowercase: true,
    },
    {
      href: companyLinkedinUrl,
      icon: <BrandIcon brand="linkedin" size={20} />,
      title: "Connect with Us",
      // linkedin.com/company/<name>
      label: getPathSegments(companyLinkedinUrl).at(-1) ?? "Karakod",
      lowercase: false,
    },
  ].filter((link) => link.href);

  return (
    // A container card: each item has its own state layer, so the card-wide one stays off
    <Card className={cn("gap-0 p-2", className)}>
      <MotionGrid className="flex flex-1 flex-col gap-0 *:flex-1 sm:gap-0">
        {links.map(({ href, icon, title, label, lowercase }) => (
          <Link
            key={title}
            href={href}
            className="state-layer group text-on-surface flex h-full min-h-18 items-center gap-4 rounded-sm px-4 py-2 focus-visible:outline-none"
          >
            {/* Primary fill: a container role would blend into the card in some palettes */}
            <span className="bg-primary text-on-primary flex size-10 shrink-0 items-center justify-center rounded-full">
              {icon}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="type-label-medium text-on-surface-variant">{title}</span>
              <span className="type-body-large truncate">
                {lowercase ? label.toLowerCase() : label}
              </span>
            </span>
            <Icon
              name="arrow_outward"
              size={20}
              className="text-on-surface-variant group-hover:text-primary ease-standard shrink-0 transition-colors duration-200"
            />
          </Link>
        ))}
      </MotionGrid>
    </Card>
  );
}
