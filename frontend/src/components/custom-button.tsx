import Link from "next/link";
import { Icon } from "@/components/icon";
import type { IconName } from "@/components/icon-names";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomButtonProps extends Omit<ButtonProps, "children" | "asChild"> {
  text: string;
  icon?: IconName;
  /** Renders a link styled as the button, instead of a <button> (never nest one in a link) */
  href?: string;
}

// The page's main call to action: a medium filled button with a trailing icon
export default function CustomButton({
  text,
  className,
  icon = "arrow_forward",
  href,
  size = "lg",
  ...props
}: CustomButtonProps) {
  const content = (
    <>
      {text}
      <Icon
        name={icon}
        className="ease-standard transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
      />
    </>
  );

  return href ? (
    <Button asChild size={size} className={cn("group w-fit pr-5", className)} {...props}>
      <Link href={href}>{content}</Link>
    </Button>
  ) : (
    <Button size={size} className={cn("group w-fit pr-5", className)} {...props}>
      {content}
    </Button>
  );
}
