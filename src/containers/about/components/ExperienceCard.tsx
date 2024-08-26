import { BriefcaseBusiness, GraduationCap } from "lucide-react";

interface ExperienceCardProps {
  title: string;
  company: string;
  duration: string;
  description: string;
  type: string;
}

export default function ExperienceCard({
  title,
  company,
  duration,
  description,
  type,
}: ExperienceCardProps) {
  return (
    <div className="relative row-span-3 grid grid-rows-subgrid gap-4 border-l border-muted pl-10">
      <span className="absolute -left-5 z-10 flex size-10 items-center justify-center rounded-full bg-primary p-1">
        {type === "work" ? (
          <BriefcaseBusiness size={24} />
        ) : (
          <GraduationCap size={24} />
        )}
      </span>
      <span className="mt-1 w-fit rounded-full bg-muted px-2 py-1 text-xs font-semibold tracking-wider">
        {duration}
      </span>
      <h2 className="text-xl uppercase">
        {title} - &nbsp;
        <span className="text-lg font-semibold uppercase opacity-75">
          {company}
        </span>
      </h2>
      <p>{description}</p>
    </div>
  );
}
