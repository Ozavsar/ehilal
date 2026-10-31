import * as React from "react";

import { cn } from "@/lib/utils";

// M3 filled card (`isolate` keeps the media clip while a thumbnail scales). `interactive`: a
// card-wide state layer while a link or button inside is hovered or focused.
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }
>(({ className, interactive = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-surface-container-highest text-on-surface relative isolate flex h-full flex-col overflow-hidden rounded-md",
      interactive && [
        "after:bg-on-surface after:ease-standard after:pointer-events-none after:absolute after:inset-0 after:-z-1 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-150",
        "has-[a:focus-visible,button:focus-visible]:after:opacity-12 has-[a:hover,button:hover]:after:opacity-8",
      ],
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

// Media slot at the top of the card
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col overflow-hidden", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("type-title-medium", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-on-surface-variant type-body-medium", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-2 p-4 pb-2", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-auto flex items-center justify-between gap-2 p-4 pt-2", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
