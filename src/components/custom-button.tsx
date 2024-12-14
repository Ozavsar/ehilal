import { Button } from "@/components/ui/button";
import { LucideIcon, ArrowRight } from "lucide-react";

interface CustomButtonProps {
  text: string;
  className?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  [key: string]: any;
}

export default function CustomButton({
  text,
  className = "",
  onClick,
  icon: Icon = ArrowRight,
  ...props
}: CustomButtonProps) {
  return (
    <Button
      className={`group relative flex h-14 w-fit items-center gap-6 overflow-hidden rounded-full border border-primary bg-transparent px-10 pr-0 font-bold uppercase text-foreground transition-transform hover:text-white ${className}`}
      onClick={onClick}
      {...props}
    >
      {text}
      <span className="relative flex size-14 items-center justify-center rounded-full bg-primary">
        <Icon className="text-white" />{" "}
      </span>
      <span className="absolute right-0 -z-10 h-14 w-0 rounded-full bg-primary transition-all duration-700 ease-out group-hover:w-96 group-active:w-0 group-active:duration-150" />
    </Button>
  );
}
