import AnimatedCounter from "@/components/AnimatedCounter";
import { Plus } from "lucide-react";

interface StatCardProps {
  value: string;
  description: string;
}

export default function StatCard({ value, description }: StatCardProps) {
  return (
    <li className="relative row-span-2 grid grid-rows-subgrid rounded-[5px] border border-muted p-4 sm:p-7">
      <h3 className="relative w-fit text-3xl font-bold leading-snug text-primary sm:text-5xl">
        <AnimatedCounter from={0} to={+value} />
        <Plus size={24} className="absolute -right-6 top-4 text-primary" />
        &nbsp;
      </h3>
      <p className="h-full min-h-[3em] uppercase leading-[1.5] sm:pl-14">
        {description}
      </p>
      <span className="absolute bottom-[58px] left-10 flex h-[1px] w-8 rounded-full bg-muted max-sm:hidden" />
    </li>
  );
}
