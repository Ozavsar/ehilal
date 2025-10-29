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
      className={`after:ease-[cubic-bezier(0.65_0.05_0.36_1)] relative text-xs text-foreground after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-full after:origin-bottom-right after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 ${className || ""}`}
    >
      {children}
    </a>
  );
}
