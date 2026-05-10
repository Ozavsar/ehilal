import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "bg-muted/50 text-foreground ring-offset-background placeholder:text-muted-foreground/50 hover:bg-muted focus-visible:border-primary/50 focus-visible:bg-background focus-visible:ring-primary/10 flex h-12 w-full rounded-xl border-2 border-transparent px-4 py-2 text-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
