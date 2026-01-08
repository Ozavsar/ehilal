"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { COMPANY_LINKEDIN_URL } from "@/config/constants";
import { LuLinkedin, LuMail, LuYoutube } from "react-icons/lu";
import { BsTwitterX } from "react-icons/bs";
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
  };
}

export default function InfoSection({
  content,
  socialMediaLinks,
  className,
}: IInfoSectionProps) {
  const links = [
    {
      href: `mailto:${socialMediaLinks.email}`,
      icon: LuMail,
      title: "Mail Me",
      label: socialMediaLinks.email,
      lowercase: true,
    },
    {
      href: socialMediaLinks.twitter_x,
      icon: BsTwitterX,
      title: "Follow Me",
      label: "@" + socialMediaLinks.twitter_x.split("/")[3],
      lowercase: true,
    },
    {
      href: socialMediaLinks.linkedin,
      icon: LuLinkedin,
      title: "Connect with Me",
      label: socialMediaLinks.linkedin.split("/")[4].replace(/-/g, " "),
      lowercase: false,
    },
    {
      href: socialMediaLinks.youtube || "#",
      icon: LuYoutube,
      title: "Subscribe",
      label: socialMediaLinks.youtube?.split("/")[3] || "@elifhilalumucu",
      lowercase: true,
    },
    {
      href: COMPANY_LINKEDIN_URL,
      icon: LuLinkedin,
      title: "Connect with Us",
      label: COMPANY_LINKEDIN_URL.split("/")[4],
      lowercase: false,
    },
  ];
  return (
    <div className={cn("max-md:mb-8", className)}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4 text-2xl font-bold uppercase sm:text-3xl"
      >
        {content.title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-sm:text-sm"
      >
        {content.description}
      </motion.p>
      <MotionGrid className="mt-4 flex flex-col gap-4 text-sm">
        {links.map(({ href, icon: Icon, title, label, lowercase }, i) => (
          <Link key={i} href={href} aria-label={title} className="w-full">
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="group border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5 dark:bg-card/40 relative flex w-full items-center gap-5 overflow-hidden rounded-2xl border p-5 shadow-sm transition-colors duration-300 hover:shadow-md"
            >
              <div className="relative z-10 flex items-center gap-5">
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
            </motion.div>
          </Link>
        ))}
      </MotionGrid>
    </div>
  );
}
