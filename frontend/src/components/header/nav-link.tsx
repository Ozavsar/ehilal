"use client";

import { useState, type ComponentProps } from "react";
import Link from "next/link";
import { useSettledAfterLoad } from "@/hooks/use-idle-after-load";

type NavLinkProps = Omit<ComponentProps<typeof Link>, "prefetch">;

// Prefetches once the page has settled after load, or earlier on intent (hover, focus, touch), so
// the nav's links don't compete with the page's LCP image and scripts.
export default function NavLink(props: NavLinkProps) {
  const settled = useSettledAfterLoad();
  const [intent, setIntent] = useState(false);
  const showIntent = () => setIntent(true);

  return (
    <Link
      {...props}
      // null: Next's default prefetching (static routes in full); false: none, not even on hover
      prefetch={settled || intent ? null : false}
      onPointerEnter={showIntent}
      onFocus={showIntent}
      onTouchStart={showIntent}
    />
  );
}
