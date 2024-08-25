import Nav from "./Nav";
import ThemeSwitch from "./ThemeSwitch";

export default function Header() {
  return (
    <header className="fixed bottom-0 z-10 flex w-full sm:right-0 sm:h-full sm:w-fit">
      <ThemeSwitch />
      <Nav />
    </header>
  );
}
