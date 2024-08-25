import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CustomButton({
  text,
  className = "",
  onClick,
  ...props
}: {
  text: string;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}) {
  return (
    <Button
      className={`group relative flex h-14 w-fit items-center gap-6 overflow-hidden rounded-full border border-primary bg-transparent px-10 hover:text-white pr-0 font-bold ${className}`}
      onClick={onClick}
      {...props}
    >
      {text}
      <span className="relative flex size-14 items-center justify-center rounded-full bg-primary">
        <ArrowRight className="text-white" />
      </span>
      <span className="absolute right-0 -z-10 h-14 w-0 rounded-full bg-primary transition-all duration-700 ease-out group-hover:w-96" />
    </Button>
  );
}
