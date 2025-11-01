"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { COMPANY_LINKEDIN_URL } from "@/config/constants";
import { LuLinkedin, LuMail, LuYoutube } from "react-icons/lu";
import { BsTwitterX } from "react-icons/bs";
import MotionGrid from "@/components/motion-grid";
import { cn } from "@/lib/utils";

interface IInfoSectionProps {
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
    <div className="max-md:col-span-3">
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
      <MotionGrid className="mt-4 flex flex-col gap-3 text-sm">
        {links.map(({ href, icon: Icon, title, label, lowercase }, i) => (
          <Link key={i} href={href} aria-label={title}>
            <motion.div className="group relative flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-xl border border-border bg-primary/5 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
              <div className="relative z-10 flex items-center gap-4">
                <motion.div
                  whileHover={{ rotate: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-inner shadow-primary/10"
                >
                  <Icon className="size-6" />
                </motion.div>

                <div className="flex flex-col">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                    {title}
                  </h3>
                  <p
                    className={cn(
                      "font-semibold capitalize text-foreground",
                      lowercase && "lowercase",
                    )}
                  >
                    {label}
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
