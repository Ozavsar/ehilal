"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, title, ...props }, ref) => {
  const [progress, setProgress] = React.useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(value!), 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col">
      <p className="p-1 font-medium">{title}</p>

      <div className="relative w-full">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
            className,
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className="h-full w-full flex-1 bg-primary transition-all"
            style={{ transform: `translateX(-${100 - (progress || 0)}%)` }}
          />
        </ProgressPrimitive.Root>
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-xs font-semibold">
          {progress}%
        </span>
      </div>
    </div>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
