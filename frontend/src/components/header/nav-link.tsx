"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useSettledAfterLoad } from "@/hooks/use-idle-after-load";

interface NavLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

// The nav is on every page, and by default its links prefetch all six routes (RSC payloads and
// page chunks) as soon as they are visible, competing with the page's own LCP image and scripts.
// Here they prefetch once the page has settled after load, or earlier on intent (pointer over the
// link, keyboard focus, touch), so a tap or click still navigates without waiting for the server.
export default function NavLink({ href, className, children }: NavLinkProps) {
  const settled = useSettledAfterLoad();
  const [intent, setIntent] = useState(false);
  const showIntent = () => setIntent(true);

  return (
    <Link
      href={href}
      className={className}
      // null: Next's default prefetching (static routes in full); false: none, not even on hover
      prefetch={settled || intent ? null : false}
      onPointerEnter={showIntent}
      onFocus={showIntent}
      onTouchStart={showIntent}
    >
      {children}
    </Link>
  );
}
