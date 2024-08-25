export default function TitleSection() {
  return (
    <section>
      <div className="relative flex flex-col items-center justify-center py-[70px] max-sm:hidden">
        <h2 className="text-[56px] font-black uppercase">
          About <span className="text-primary">Me</span>
        </h2>
        <span className="absolute top-[48%] -z-10 -translate-y-[50%] text-[110px] font-extrabold uppercase tracking-[5px] text-muted">
          Resume
        </span>
      </div>
      <div className="fixed top-0 left-0 w-full bg-muted py-4 pl-6 sm:hidden">
        <h2 className="text-2xl font-black uppercase">
          About <span className="text-primary">Me</span>
        </h2>
      </div>
    </section>
  );
}
