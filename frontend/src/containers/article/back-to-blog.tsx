"use client";

import type { ComponentProps, MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { buttonVariants } from "@/components/ui/button";
import { NAV_BACK } from "@/components/view-transitions";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { cn } from "@/lib/utils";

const BLOG_LIST_PATH = /^\/blog(?:\/[1-9]\d*)?$/;

// The previous history entry's path when it is a blog list page of this site, else null
// (Navigation API only; elsewhere the link opens /blog)
function previousBlogListPath() {
  const { navigation } = window as Window & {
    navigation?: { currentEntry: { index: number } | null; entries(): { url: string | null }[] };
  };
  const index = navigation?.currentEntry?.index ?? 0;
  const previous = index > 0 ? navigation?.entries()[index - 1]?.url : null;
  if (!previous) return null;
  const url = new URL(previous);
  return url.origin === location.origin && BLOG_LIST_PATH.test(url.pathname) ? url.pathname : null;
}

// Back to the list page the reader came from (else the first one). A push, not a history step:
// React runs no view transition for a popstate navigation, so the morph back would be lost.
export default function BackToBlog({
  className,
  iconOnly = false,
  ...props
}: Omit<ComponentProps<typeof Link>, "href" | "onClick" | "transitionTypes" | "children"> & {
  // In the scrolled top app bar: a 40dp icon button, the label stays as its accessible name
  iconOnly?: boolean;
}) {
  const router = useRouter();

  const goBack = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const path = previousBlogListPath();
    if (!path) return;
    event.preventDefault();
    router.push(path, { transitionTypes: [NAV_BACK] });
  };
  return (
    <Link
      {...props}
      href={INTERNAL_ROUTES.BLOG.href()}
      transitionTypes={[NAV_BACK]}
      onClick={goBack}
      className={cn(
        buttonVariants({ variant: "ghost", size: iconOnly ? "icon" : "default" }),
        !iconOnly && "pr-4",
        className,
      )}
    >
      <Icon name="arrow_back" />
      <span className={cn(iconOnly && "sr-only")}>Back to blog</span>
    </Link>
  );
}
