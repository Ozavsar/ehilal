import Image from "next/image";
import CustomButton from "@/components/custom-button";
import SocialLinks from "@/components/social-links";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { getSiteSettings } from "@/lib/services";
import type { IStrapiHomePage } from "@/types";
import { RevealWords } from "./reveal-words";

interface IHomeContainerProps {
  content: IStrapiHomePage;
}

// Portrait box ratio from expanded (840px) up, width / height
const PORTRAIT_RATIO = 3 / 4;

// Entrance timeline (ms). The introduction (LCP on phones) fades in as one block: word by word
// would put LCP at its last word.
const NAME_DELAY = 200;
const GREETING_DELAY = 350;
const GREETING_STEP = 80;

// Rendered width of the portrait: the 208px avatar below 840px, then 2fr of 5 of the window minus
// rail, margins and gap. object-cover renders a wider image max(1, image / box ratio) times wider.
function getPortraitSizes({ width, height }: IStrapiHomePage["hero_image"]) {
  const scale = width && height ? Math.max(1, width / height / PORTRAIT_RATIO) : 1;
  const column = (expression: string) => `calc((${expression}) * ${(0.4 * scale).toFixed(3)})`;
  return [
    `(min-width: 1344px) ${column("1200px - 64px")}`,
    `(min-width: 1200px) ${column("100vw - 208px")}`,
    `(min-width: 840px) ${column("100vw - 192px")}`,
    "208px",
  ].join(", ");
}

const countWords = (text: string | null | undefined) =>
  text?.split(/\s+/).filter(Boolean).length ?? 0;

export default async function HomeContainer({ content }: IHomeContainerProps) {
  const { hero_image: heroImage } = content;
  const { siteName, jobTitle } = await getSiteSettings();

  const introDelay =
    GREETING_DELAY + Math.round(countWords(content.greeting) * GREETING_STEP * 0.5);
  const actionsDelay = introDelay + 250;

  return (
    // From 840px the hero extends under the transparent rail (negative margin, same padding) so the
    // band reaches the window's edge; data-hero-band gives the rail's items the band's on-colours
    <main
      id="main"
      data-hero-band
      className="md:-ml-rail md:pl-rail relative isolate flex overflow-x-clip md:min-h-svh md:overflow-clip"
    >
      {/* Window height from 840px, so the portrait column (and its band) spans the whole hero */}
      <div className="container grid items-center gap-8 py-8 md:grid-cols-[2fr_3fr] md:gap-12 lg:gap-16">
        <div className="relative justify-self-center md:flex md:w-full md:items-center md:self-stretch">
          {/* The colour band. Skewed, not rotated: a rotated box's bounding box reaches under the
              text and contrast checkers (axe) measure against it. */}
          <span
            aria-hidden="true"
            className="animate-hero-band bg-primary dark:bg-primary-container after:bg-tertiary absolute bottom-1/2 left-1/2 z-(--z-behind) ml-[-50vw] h-screen w-screen origin-bottom -skew-y-15 [--hero-band-from:0_-40vh] after:absolute after:inset-x-0 after:top-full after:mt-3 after:h-2 md:hidden"
          />
          <span
            aria-hidden="true"
            className="animate-hero-band bg-primary dark:bg-primary-container after:bg-tertiary absolute -inset-y-8 right-1/2 z-(--z-behind) w-screen origin-right skew-x-15 [--hero-band-from:-50vw_0] after:absolute after:inset-y-0 after:left-full after:ml-3 after:w-2 max-md:hidden"
          />

          {/* One image for both layouts (avatar below 840px, portrait from there), downloaded once.
              The LCP element: eager, and animated by transform only. */}
          <Image
            src={heroImage.url}
            alt={`Portrait of ${siteName}`}
            width={700}
            height={700}
            sizes={getPortraitSizes(heroImage)}
            loading="eager"
            fetchPriority="high"
            blurDataURL={heroImage.blurDataURL}
            placeholder={heroImage.blurDataURL ? "blur" : "empty"}
            draggable={false}
            className="ring-surface md:animate-hero-in md:shadow-elevation-3 size-52 rounded-full object-cover ring-6 select-none md:aspect-3/4 md:h-auto md:w-full md:rounded-xl md:ring-0"
          />
        </div>

        <div className="flex flex-col gap-6">
          {/* The <h1> comes from Site Settings, so it exists even when the CMS greeting is empty */}
          <h1 className="type-title-medium text-on-surface-variant flex items-center gap-3">
            <span
              aria-hidden="true"
              className="animate-hero-line bg-primary h-1 w-10 shrink-0 origin-left rounded-full"
              style={{ animationDelay: `${NAME_DELAY}ms` }}
            />
            <span className="animate-hero-rise" style={{ animationDelay: `${NAME_DELAY + 50}ms` }}>
              <span className="text-on-surface">{siteName}</span> — {jobTitle}
            </span>
          </h1>

          {content.greeting && (
            <p className="type-display-small sm:type-display-medium lg:type-display-large text-primary text-balance">
              <RevealWords
                text={content.greeting}
                delay={GREETING_DELAY}
                step={GREETING_STEP}
                wordClassName="[--hero-rise:0.4em]"
              />
            </p>
          )}

          {content.introduction && (
            <p
              className="type-body-large lg:type-title-large text-on-surface-variant animate-hero-rise text-pretty [--hero-rise:0.75rem]"
              style={{ animationDelay: `${introDelay}ms` }}
            >
              {content.introduction}
            </p>
          )}

          <div
            className="animate-hero-rise flex flex-wrap items-center gap-4 pt-2"
            style={{ animationDelay: `${actionsDelay}ms` }}
          >
            <CustomButton href={INTERNAL_ROUTES.CONTACT.path} text="Get in touch" />
            <SocialLinks />
          </div>
        </div>
      </div>
    </main>
  );
}
