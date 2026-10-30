import Image from "next/image";
import CustomButton from "@/components/custom-button";
import SocialLinks from "@/components/social-links";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { getSiteSettings } from "@/lib/services";
import type { IStrapiHomePage } from "@/types";

interface IHomeContainerProps {
  content: IStrapiHomePage;
}

// Portrait box ratio from expanded (840px) up, width / height
const PORTRAIT_RATIO = 4 / 5;

// Rendered width of the portrait: the 208px round avatar below 840px, from there the first column
// of the hero grid (2fr of 5) beside the 96px rail, 2 x 24px margins and the column gap (48px, 64px
// from 1200px), until the 1200px content column is full at 1344px. object-cover scales an image
// wider than the box to the box height, so it renders max(1, image ratio / box ratio) times wider.
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

export default async function HomeContainer({ content }: IHomeContainerProps) {
  const { hero_image: heroImage } = content;
  // Never throws: falls back to the defaults in config/site.ts
  const { siteName, jobTitle } = await getSiteSettings();

  return (
    <main id="main" className="flex md:min-h-svh md:items-center">
      <div className="container grid items-center gap-8 py-8 md:grid-cols-[2fr_3fr] md:gap-12 lg:gap-16">
        {/* One image for both layouts, so each viewport downloads it once: a round avatar on compact
            and medium windows, a portrait in the first column from 840px. It is the LCP element, load
            it first. */}
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
          className="ring-primary-container md:motion-safe:animate-hero-in size-52 justify-self-center rounded-full object-cover ring-4 select-none md:aspect-4/5 md:h-auto md:w-full md:rounded-xl md:ring-0"
        />

        <div className="flex flex-col gap-6">
          {/* The page's <h1> comes from the Site Settings, so it is there even when the optional
              CMS greeting is empty; visually the greeting leads, as before */}
          <h1 className="sr-only">
            {siteName} — {jobTitle}
          </h1>
          {content.greeting && (
            <p className="type-display-small sm:type-display-medium lg:type-display-large text-primary">
              {content.greeting}
            </p>
          )}

          {/* @starting-style fade-in: plain text in the HTML, no client JS, still for reduced motion */}
          <p className="type-body-large lg:type-title-large text-on-surface-variant ease-emphasized-decelerate transition-[opacity,translate] duration-500 motion-reduce:transition-none starting:translate-y-2 starting:opacity-0">
            {content.introduction}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <CustomButton href={INTERNAL_ROUTES.CONTACT.path} text="Get in touch" />
            <SocialLinks />
          </div>
        </div>
      </div>
    </main>
  );
}
