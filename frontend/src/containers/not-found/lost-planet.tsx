import Image from "next/image";
import { RocketGlyph } from "@/components/header/rocket-dock";
import { getStoredBlurDataURL } from "@/lib/getImage";
import { cn } from "@/lib/utils";
import type { IImage } from "@/types";
import styles from "./orbit.module.css";

/** The "0" of the 404: a planet (the Strapi not-found image, else craters) circled by the rocket */
export function LostPlanet({ image }: { image: IImage | null | undefined }) {
  const blurDataURL = image ? getStoredBlurDataURL(image) : undefined;
  // object-cover fills the disc's height with a landscape image, so it renders wider than the disc
  const aspect = image?.width && image.height ? Math.max(1, image.width / image.height) : 1;

  return (
    <span className="relative block size-48 shrink-0 sm:size-64 lg:size-80">
      <span className="border-outline-variant absolute inset-4 rounded-full border-2 border-dashed" />

      {/* The disc is 100px, 144px from sm, 192px from lg (the image `sizes` below) */}
      <span className="bg-tertiary-container absolute inset-10 rounded-full p-1.5 sm:inset-12 sm:p-2 lg:inset-14">
        <span className="bg-primary-container relative block size-full overflow-hidden rounded-full">
          {image ? (
            <Image
              src={image.url}
              alt=""
              fill
              sizes={`(min-width: 1200px) ${Math.ceil(192 * aspect)}px, (min-width: 600px) ${Math.ceil(144 * aspect)}px, ${Math.ceil(100 * aspect)}px`}
              placeholder={blurDataURL ? "blur" : "empty"}
              blurDataURL={blurDataURL}
              draggable={false}
              className="object-cover select-none"
            />
          ) : (
            <>
              <span className="bg-on-primary-container/12 absolute top-1/5 left-1/5 size-1/3 rounded-full" />
              <span className="bg-on-primary-container/12 absolute right-1/5 bottom-1/4 size-1/4 rounded-full" />
              <span className="bg-on-primary-container/12 absolute bottom-1/6 left-1/3 size-1/8 rounded-full" />
            </>
          )}
        </span>
      </span>

      {/* The surface disc behind the rocket hides the orbit's dashes between its fins */}
      <span className={cn("absolute inset-4", styles.orbit)}>
        <span className="bg-surface absolute top-0 left-1/2 grid size-10 -translate-1/2 rotate-90 place-items-center rounded-full lg:size-12">
          <RocketGlyph className="h-8 w-6 lg:h-10 lg:w-7" />
        </span>
      </span>
    </span>
  );
}
