import { cn } from "@/lib/utils";

interface TitleSectionProps {
  text: string;
  backgroundText: string;
}

// Entrance animations are @starting-style transitions (Tailwind `starting:`): they run when the
// element is first rendered, need no client JS, and are skipped for reduced-motion users.
export default function TitleSection({ text, backgroundText }: TitleSectionProps) {
  const words = text.trim().split(" ");
  const lastWord = words.pop() || "";
  const plainWord = words.join(" ");

  return (
    <section>
      {/* Desktop */}
      <div className="relative flex flex-col items-center justify-center overflow-visible py-17.5 max-sm:hidden">
        <span
          className={cn(
            "text-muted-foreground/25 dark:text-card text-backdrop tracking-backdrop absolute top-1/3 left-1/2 z-(--z-behind) -translate-x-1/2 -translate-y-1/3 font-extrabold uppercase opacity-25",
            "transition-[opacity,transform] duration-1500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none starting:[transform:translateY(40px)_scale(1.2)] starting:opacity-0",
          )}
        >
          {backgroundText}
        </span>

        <h2
          className={cn(
            "text-page-title font-black uppercase",
            "transition-[opacity,translate] duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none starting:translate-y-15 starting:opacity-0",
          )}
        >
          {plainWord}{" "}
          <span
            className={cn(
              plainWord && "text-primary inline-block",
              "transition-[opacity,translate] duration-1000 ease-out motion-reduce:transition-none starting:translate-x-2.5 starting:opacity-0",
            )}
          >
            {lastWord}
          </span>
        </h2>
      </div>

      {/* Mobile */}
      <div className="bg-muted fixed top-0 left-0 z-(--z-title-bar) w-full py-4 pl-6 shadow-lg sm:hidden">
        <h2
          className={cn(
            "text-2xl font-black uppercase",
            "transition-[opacity,scale,translate] duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none starting:-translate-y-1 starting:scale-90 starting:opacity-0",
          )}
        >
          {plainWord} <span className={plainWord ? "text-primary" : ""}>{lastWord}</span>
        </h2>
      </div>
    </section>
  );
}
