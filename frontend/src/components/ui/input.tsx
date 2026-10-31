import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// M3 outlined text field, shared with Textarea. On focus the inset ring adds the second outline
// pixel without shifting the text.
export const textFieldClassName =
  "border-outline text-on-surface caret-primary placeholder:text-on-surface-variant type-body-large ease-standard hover:border-on-surface focus-visible:border-primary focus-visible:inset-ring-primary aria-invalid:border-error aria-invalid:hover:border-on-error-container aria-invalid:focus-visible:border-error aria-invalid:focus-visible:inset-ring-error disabled:border-on-surface/12 disabled:text-on-surface/38 flex w-full rounded-xs border bg-transparent px-4 transition-[border-color,box-shadow] duration-150 outline-none focus-visible:inset-ring-1 disabled:cursor-not-allowed";

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          textFieldClassName,
          "file:type-label-large h-14 file:border-0 file:bg-transparent",
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
