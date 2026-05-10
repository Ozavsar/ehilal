import { LuArrowRight } from "react-icons/lu";
import type { IconType } from "react-icons/lib";
import { Button } from "@/components/ui/button";

interface CustomButtonProps {
  text: string;
  className?: string;
  onClick?: () => void;
  icon?: IconType;
  [key: string]: any;
}

export default function CustomButton({
  text,
  className = "",
  onClick,
  icon: Icon = LuArrowRight,
  ...props
}: CustomButtonProps) {
  return (
    <Button
      className={`group border-primary text-foreground relative flex h-14 w-fit cursor-pointer items-center gap-6 overflow-hidden rounded-full border bg-transparent px-10 pr-0 font-bold uppercase transition-all duration-500 ease-out hover:scale-105 hover:text-white active:scale-95 ${className}`}
      onClick={onClick}
      {...props}
    >
      {text}
      <span className="bg-primary relative flex size-14 items-center justify-center rounded-full">
        <Icon size={24} className="text-white" />{" "}
      </span>
      <span className="bg-primary absolute inset-0 -z-10 h-full w-full origin-right scale-x-0 rounded-full transition-transform duration-500 ease-out group-hover:scale-x-100 group-active:scale-x-0 group-active:duration-150" />
    </Button>
  );
}
