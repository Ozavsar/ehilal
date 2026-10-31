import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A secondary link in a card footer, as an M3 text button
export default function LinkButton({
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
}) {
  return (
    <a {...props} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), className)}>
      {children}
      {props.target === "_blank" && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
