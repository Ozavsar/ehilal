interface TitleSectionProps {
  text: string;
  backgroundText: string;
}

export default function TitleSection({
  text,
  backgroundText,
}: TitleSectionProps) {
  const words = text.trim().split(" ");
  const lastWord = words.pop() || "";
  const plainWord = words.join(" ");
  return (
    <section>
      <div className="relative flex flex-col items-center justify-center py-[70px] max-sm:hidden">
        <h2 className="text-[56px] font-black uppercase">
          {plainWord}{" "}
          <span className={plainWord ? "text-primary" : ""}>{lastWord}</span>
        </h2>
        <span className="absolute top-[48%] -z-10 -translate-y-[50%] text-[110px] font-extrabold uppercase tracking-[5px] text-muted">
          {backgroundText}
        </span>
      </div>
      <div className="fixed left-0 top-0 z-20 w-full bg-muted py-4 pl-6 sm:hidden">
        <h2 className="text-2xl font-black uppercase">
          {plainWord}{" "}
          <span className={plainWord ? "text-primary" : ""}>{lastWord}</span>
        </h2>
      </div>
    </section>
  );
}
