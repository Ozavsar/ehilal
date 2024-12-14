import NavigationLinks from "./navigation-links";
import ThemeSwitchButton from "./theme-switch-button";

export default function Header() {
  return (
    <header className="fixed bottom-0 z-10 flex w-full sm:right-0 sm:h-full sm:w-fit">
      <ThemeSwitchButton />
      <NavigationLinks />
    </header>
  );
}
