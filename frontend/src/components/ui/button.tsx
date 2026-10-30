import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// M3 common buttons: pill shaped, label-large, hover/focus/press from the state layer (currentColor
// over the container), focus ring 3px with a 2px gap, disabled = on-surface at 38% on a 12% container.
// Icons (<Icon>, sized through the inherited --icon-size) are 18dp, 24dp in the medium and icon buttons.
// touch-target: 48dp hit area on touch screens for the 32/40dp sizes.
const buttonVariants = cva(
  "state-layer touch-target inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full type-label-large transition-shadow duration-200 ease-standard outline-primary focus-visible:outline-3 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:text-on-surface/38 [--icon-size:18px] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Filled: the highest emphasis, one per view
        default:
          "bg-primary text-on-primary hover:shadow-elevation-1 disabled:bg-on-surface/12 disabled:shadow-none",
        // Filled tonal: medium emphasis
        tonal:
          "bg-secondary-container text-on-secondary-container hover:shadow-elevation-1 disabled:bg-on-surface/12 disabled:shadow-none",
        destructive:
          "bg-error text-on-error hover:shadow-elevation-1 disabled:bg-on-surface/12 disabled:shadow-none",
        outline: "border border-outline text-primary disabled:border-on-surface/12",
        // M3 text button
        ghost: "text-primary",
        link: "state-layer-none text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6",
        sm: "h-8 px-4",
        // M3 medium button (56dp), for a page's main call to action
        lg: "h-14 px-6 type-title-medium [--icon-size:24px]",
        // M3 icon button container: 40dp, 24dp icon
        icon: "size-10 [--icon-size:24px] [&_svg]:size-6",
      },
    },
    compoundVariants: [
      // Text buttons have less padding than the contained ones
      { variant: "ghost", size: "default", className: "px-3" },
      { variant: "ghost", size: "sm", className: "px-3" },
      { variant: "link", size: "default", className: "px-0" },
      { variant: "link", size: "sm", className: "px-0" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
