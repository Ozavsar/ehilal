import Link from "next/link";
import { YOUTUBE_CHANNEL_HANDLE } from "@/config/constants";
import { LuLinkedin, LuMail, LuYoutube } from "react-icons/lu";
import { BsInstagram, BsTwitterX } from "react-icons/bs";
import MotionGrid from "@/components/motion-grid";
import { cn } from "@/lib/utils";

interface IInfoSectionProps {
  className?: string;
  content: {
    title: string;
    description: string;
  };
  socialMediaLinks: {
    email: string;
    twitter_x: string;
    linkedin: string;
    youtube: string;
    instagram?: string | null;
  };
  companyLinkedinUrl: string;
}

// CMS URLs may end with "/", lack "www" or carry a query string (?igsh=...), so parse them
// instead of indexing split("/"). Returns [] for empty or invalid URLs.
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

export default function InfoSection({
  content,
  socialMediaLinks,
  companyLinkedinUrl,
  className,
}: IInfoSectionProps) {
  const youtubeHandle = getPathSegments(socialMediaLinks.youtube).find((s) => s.startsWith("@"));

  // Links not filled in Strapi (e.g. the optional Instagram) are skipped
  const links = [
    {
      href: socialMediaLinks.email && `mailto:${socialMediaLinks.email}`,
      icon: LuMail,
      title: "Mail Me",
      label: socialMediaLinks.email,
      lowercase: true,
    },
    {
      href: socialMediaLinks.twitter_x,
      icon: BsTwitterX,
      title: "Follow Me",
      label: toHandle(getPathSegments(socialMediaLinks.twitter_x)[0]) ?? "X (Twitter)",
      lowercase: true,
    },
    {
      href: socialMediaLinks.linkedin,
      icon: LuLinkedin,
      title: "Connect with Me",
      // linkedin.com/in/<name>
      label: getPathSegments(socialMediaLinks.linkedin).at(-1)?.replace(/-/g, " ") ?? "LinkedIn",
      lowercase: false,
    },
    {
      href: socialMediaLinks.youtube || `https://www.youtube.com/${YOUTUBE_CHANNEL_HANDLE}`,
      icon: LuYoutube,
      title: "Subscribe",
      label: youtubeHandle ?? YOUTUBE_CHANNEL_HANDLE,
      lowercase: true,
    },
    {
      href: socialMediaLinks.instagram,
      icon: BsInstagram,
      title: "Follow on Instagram",
      label: toHandle(getPathSegments(socialMediaLinks.instagram)[0]) ?? "Instagram",
      lowercase: true,
    },
    {
      href: companyLinkedinUrl,
      icon: LuLinkedin,
      title: "Connect with Us",
      // linkedin.com/company/<name>
      label: getPathSegments(companyLinkedinUrl).at(-1) ?? "Karakod",
      lowercase: false,
    },
  ].flatMap(({ href, ...link }) => (href ? [{ href, ...link }] : []));

  return (
    <div className={cn("max-md:mb-8", className)}>
      <h1 className="mb-4 text-2xl font-bold uppercase transition-[opacity,translate] duration-500 motion-reduce:transition-none sm:text-3xl starting:-translate-y-5 starting:opacity-0">
        {content.title}
      </h1>
      <p className="transition-[opacity,translate] duration-500 motion-reduce:transition-none max-sm:text-sm starting:-translate-y-5 starting:opacity-0">
        {content.description}
      </p>
      <MotionGrid className="mt-4 flex flex-col gap-4 text-sm">
        {links.map(({ href, icon: Icon, title, label, lowercase }) => (
          <Link key={title} href={href} aria-label={title} className="w-full">
            <div className="group border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5 dark:bg-card/40 relative flex w-full items-center gap-5 overflow-hidden rounded-2xl border p-5 shadow-sm transition-[color,background-color,border-color,box-shadow,translate,scale] duration-300 hover:shadow-md motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.01] motion-safe:active:scale-[0.98]">
              <div className="relative z-(--z-raised) flex items-center gap-5">
                <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:shadow-primary/20 flex size-12 items-center justify-center rounded-xl transition-transform duration-500 ease-out group-hover:scale-110 group-hover:text-white group-hover:shadow-lg">
                  <Icon className="size-5" />
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-muted-foreground group-hover:text-primary text-xs font-bold tracking-widest uppercase transition-colors">
                    {title}
                  </h3>
                  <p className="text-foreground group-hover:text-foreground/90 font-medium transition-colors">
                    {lowercase ? label.toLowerCase() : label}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </MotionGrid>
    </div>
  );
}
