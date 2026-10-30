import { cn } from "@/lib/utils";

interface TitleSectionProps {
  text: string;
  backgroundText: string;
  /** Heading level; pass "h1" where the page has no other h1 */
  as?: "h1" | "h2";
}

// The list pages' title: one heading for every window size (display role sizes, uppercase and
// black weight), the last word in the primary colour, and from sm a large faded word behind it
// (decorative, hidden from assistive tech).
// Entrances are @starting-style transitions (Tailwind `starting:`): they run when the element is
// first rendered, need no client JS, and are skipped for reduced-motion users.
export default function TitleSection({
  text,
  backgroundText,
  as: Heading = "h2",
}: TitleSectionProps) {
  const words = text.trim().split(" ");
  const lastWord = words.pop() || "";
  const plainWord = words.join(" ");

  return (
    <section className="relative flex flex-col items-center justify-center overflow-x-clip py-8 text-center sm:py-16">
      <span
        aria-hidden="true"
        className={cn(
          "text-outline-variant text-backdrop tracking-backdrop absolute top-1/2 left-1/2 z-(--z-behind) -translate-1/2 font-extrabold whitespace-nowrap uppercase opacity-25 select-none max-sm:hidden",
          "ease-emphasized-decelerate transition-[opacity,scale] duration-1000 motion-reduce:transition-none starting:scale-110 starting:opacity-0",
        )}
      >
        {backgroundText}
      </span>

      <Heading
        className={cn(
          // Each responsive role resets the weight (400), so the black weight follows every step
          "type-display-small md:type-display-medium lg:type-display-large text-on-surface uppercase",
          "font-black md:font-black lg:font-black",
          "ease-emphasized-decelerate transition-[opacity,translate] duration-500 motion-reduce:transition-none starting:translate-y-4 starting:opacity-0",
        )}
      >
        {plainWord} <span className={cn(plainWord && "text-primary")}>{lastWord}</span>
      </Heading>
    </section>
  );
}
