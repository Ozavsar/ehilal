import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Static labels shaped like M3 chips (32dp, 8dp corners, label-large); not interactive, so no
// state layer. Icons inside are 18dp like a chip's leading icon.
const badgeVariants = cva(
  "inline-flex h-8 items-center gap-2 rounded-sm px-4 type-label-large [--icon-size:18px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary",
        destructive: "bg-error-container text-on-error-container",
        // Highlights such as "Featured"
        tertiary: "bg-tertiary-container text-on-tertiary-container",
        // M3 assist chip look
        outline: "border border-outline-variant text-on-surface-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
