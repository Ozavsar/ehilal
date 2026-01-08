import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "bg-muted/50 text-foreground ring-offset-background placeholder:text-muted-foreground/50 hover:bg-muted focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-primary/10 flex min-h-30 w-full rounded-xl border-2 border-transparent px-4 py-3 text-sm transition-all duration-300 focus-visible:ring-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
