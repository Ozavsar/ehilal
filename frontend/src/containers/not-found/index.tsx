import NavLink from "@/components/header/nav-link";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { NAV_TOP } from "@/components/view-transitions";
import { INTERNAL_ROUTES, MENUS } from "@/config/constants/app-routes";
import type { IImage } from "@/types";
import { LostPlanet } from "./lost-planet";

// One line under each destination card, by INTERNAL_ROUTES key
const DESTINATION_HINTS: Record<string, string> = {
  CONFERENCES: "See the talks",
  BLOG: "Read the articles",
  VIDEOS: "Watch the videos",
  COURSES: "Take a course",
  CONTACT: "Get in touch",
};

const DESTINATIONS = MENUS.NAV.filter(({ key }) => key !== "HOME");

/**
 * The 404 page: "4, planet, 4" over a short message, a filled button home and a card for every
 * other destination so a lost visitor can carry on. Same chrome and palette as every page.
 */
export default function NotFoundView({ image }: { image: IImage | null | undefined }) {
  return (
    <main
      id="main"
      className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16"
    >
      <div
        aria-hidden="true"
        className="text-numeral text-primary flex items-center gap-2 leading-none font-black tracking-tight select-none sm:gap-4"
      >
        <span>4</span>
        <LostPlanet image={image} />
        <span>4</span>
      </div>

      <h1 className="type-headline-medium text-on-surface mt-6">
        <span className="sr-only">404: </span>Lost in space
      </h1>
      <p className="type-body-large text-on-surface-variant mt-4 max-w-xl">
        The page you&apos;re looking for has drifted beyond our radar. It may have moved, or the
        link may be broken.
      </p>

      <Button asChild className="mt-8">
        <NavLink href={INTERNAL_ROUTES.HOME.path} transitionTypes={[NAV_TOP]}>
          <Icon name="home" />
          Back to home
        </NavLink>
      </Button>

      <nav aria-labelledby="not-found-destinations" className="mt-12 w-full max-w-3xl">
        <h2 id="not-found-destinations" className="type-title-small text-on-surface-variant">
          Or pick a destination
        </h2>
        <ul className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
          {DESTINATIONS.map(({ key, label, href, icon }) => (
            <li
              key={key}
              className="basis-[calc((100%-0.75rem)/2)] sm:basis-[calc((100%-2rem)/3)] md:flex-1 md:basis-0"
            >
              <NavLink
                href={href}
                transitionTypes={[NAV_TOP]}
                className="state-layer bg-surface-container-highest text-on-surface outline-primary flex h-full flex-col items-center gap-2 rounded-md px-3 py-4 focus-visible:outline-3 focus-visible:outline-offset-2"
              >
                <span className="bg-surface text-primary grid size-10 place-items-center rounded-full">
                  <Icon name={icon} />
                </span>
                <span className="type-title-small">{label}</span>
                <span className="type-body-small text-on-surface-variant">
                  {DESTINATION_HINTS[key]}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
