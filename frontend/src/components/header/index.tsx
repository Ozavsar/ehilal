import MobileNav from "./mobile-nav";
import NavigationLinks from "./navigation-links";
import ThemeToggle from "./theme-toggle";

export default function Header() {
  return (
    <header className="fixed bottom-0 z-[21] flex w-full sm:right-0 sm:h-full sm:w-fit">
      <ThemeToggle />
      <NavigationLinks />
      <MobileNav />
    </header>
  );
}
