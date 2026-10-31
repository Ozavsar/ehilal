import type { CSSProperties } from "react";
import type { IconName } from "@/components/icon-names";
import { cn } from "@/lib/utils";

type IconProps = {
  name: IconName;
  /** FILL axis 1: M3 uses the filled glyph for active/selected states */
  filled?: boolean;
  /** M3 icon sizes in px. Left unset, the icon follows an inherited `--icon-size` (24 by default). */
  size?: 20 | 24 | 40;
  className?: string;
};

/**
 * A Material Symbols Rounded glyph from the self-hosted subset font. Always decorative: the control
 * around it carries the accessible name. Animate the fill with `--icon-fill`.
 */
export function Icon({ name, filled, size, className }: IconProps) {
  const style: Record<string, string | number> = {};
  if (filled) style["--icon-fill"] = 1;
  if (size) style["--icon-size"] = `${size}px`;

  return (
    <span
      data-slot="icon"
      aria-hidden="true"
      // A ligature name: translation would break the glyph and search snippets would quote it
      translate="no"
      data-nosnippet
      className={cn("material-symbols", className)}
      style={style as CSSProperties}
    >
      {name}
    </span>
  );
}
