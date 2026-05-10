export default function LinkButton({
  children,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
}) {
  return (
    <a
      {...props}
      className={`text-foreground after:bg-foreground relative text-xs after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-bottom-right after:scale-x-0 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.65_0.05_0.36_1)] hover:after:origin-bottom-left hover:after:scale-x-100 ${className || ""}`}
    >
      {children}
    </a>
  );
}
