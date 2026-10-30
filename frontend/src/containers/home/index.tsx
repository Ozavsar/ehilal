import Image from "next/image";
import Link from "next/link";
import CustomButton from "@/components/custom-button";
import SocialLinks from "@/components/social-links";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import type { IStrapiHomePage } from "@/types";

interface IHomeContainerProps {
  content: IStrapiHomePage;
}

// Rendered width of the portrait: the 208px round avatar below xl, the fixed hero from xl (w-1/3,
// viewport height minus 2 x --spacing-hero-inset, object-cover). A wider image than the box is
// scaled to the box height, so it renders max(box width, box height x aspect ratio) wide.
function getPortraitSizes({ width, height }: IStrapiHomePage["hero_image"]) {
  const heroWidth =
    width && height
      ? `max(34vw, calc((100vh - 2 * 2.5rem) * ${(width / height).toFixed(3)}))`
      : "34vw";
  return `(min-width: 1140px) ${heroWidth}, 208px`;
}

export default function HomeContainer({ content }: IHomeContainerProps) {
  const { hero_image: heroImage } = content;

  return (
    <main className="container flex min-h-screen items-center justify-center max-sm:py-0 max-sm:pb-4">
      <div className="bg-primary fixed -top-1/2 -left-[83%] z-(--z-behind) hidden h-[200%] w-full -rotate-15 lg:block" />

      <div className="flex max-w-md flex-col gap-8 max-sm:gap-4 md:max-w-150 md:gap-12 lg:ml-[10%] xl:ml-[35%]">
        {/* One image for both layouts, so each viewport downloads it once: a round avatar in the
            column below xl, the fixed hero on the left from xl. It is the LCP element, load it first. */}
        <Image
          src={heroImage.url}
          alt="Elif Hilal's Hero Image"
          width={700}
          height={700}
          sizes={getPortraitSizes(heroImage)}
          loading="eager"
          fetchPriority="high"
          blurDataURL={heroImage.blurDataURL}
          placeholder={heroImage.blurDataURL ? "blur" : "empty"}
          className="border-primary xl:top-hero-inset xl:left-hero-inset xl:motion-safe:animate-hero-in size-52 shrink-0 self-center rounded-full border-4 object-cover xl:fixed xl:h-[calc(100vh-2*var(--spacing-hero-inset))] xl:w-1/3 xl:rounded-3xl xl:border-0 xl:shadow-2xl"
        />

        <div className="flex w-full flex-col items-start sm:gap-6 md:items-center md:gap-10">
          {content.greeting && (
            <div className="flex gap-4 md:justify-center">
              <span className="bg-primary mt-4 h-1 w-6 rounded-md sm:mt-6 sm:w-10" />
              <h1 className="text-primary text-2xl font-bold sm:text-4xl md:text-5xl">
                {content.greeting}
              </h1>
            </div>
          )}

          <div className="flex flex-col sm:gap-2">
            {/* @starting-style fade-up: plain text in the HTML, no client JS, still for reduced motion */}
            <p className="mt-4 mb-7 text-sm leading-6 transition-[opacity,translate] duration-700 ease-out motion-reduce:transition-none md:text-lg lg:mt-[2.5px] lg:mb-6 lg:leading-7 starting:translate-y-2 starting:opacity-0">
              {content.introduction}
            </p>

            <div className="flex gap-4 max-sm:flex-col">
              <Link href={INTERNAL_ROUTES.CONFERENCES.path} className="max-sm:self-center">
                <CustomButton text="MORE ABOUT ME" />
              </Link>
              <SocialLinks />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
