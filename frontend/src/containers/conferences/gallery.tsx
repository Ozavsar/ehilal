"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { A11y, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { LuExpand } from "react-icons/lu";
import FullScreenGallery, { type IGalleryImage } from "@/components/full-screen-gallery";
// Swiper styles for the card slider and the full-screen gallery it opens
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/a11y";

export interface IConferencePhoto {
  id: number;
  url: string;
  blurDataURL?: string;
  // Strapi's `large` format (1000px on the long side), absent for smaller originals
  large?: { url: string; width: number; height: number };
}

interface Props {
  photos: IConferencePhoto[];
  title: string;
}

// Card width: one column below md, two up to xl, three from xl (MotionGrid in the page container).
// calc() instead of a bare "100vw" keeps next/image from dropping the srcset widths below 640px.
const THUMBNAIL_SIZES =
  "(min-width: 1140px) 360px, (min-width: 720px) 372px, (min-width: 540px) 508px, calc(100vw - 2rem)";

// How much the `large` format may be stretched on screen (in device pixels) before the original is
// used: up to ~1.25x the difference is barely visible, at 2x (a 1440px wide retina screen) it is soft.
const MAX_LARGE_UPSCALE = 1.25;

// Full-screen source for this screen: the light `large` format on phones and small windows, the
// original on big or high-density screens (the image optimizer resizes either, it never upscales)
function getFullScreenSrc({ url, large }: IConferencePhoto): string {
  if (!large) return url;
  const containScale = Math.min(window.innerWidth / large.width, window.innerHeight / large.height);
  return containScale * window.devicePixelRatio <= MAX_LARGE_UPSCALE ? large.url : url;
}

export default function Gallery({ photos, title }: Props) {
  // Full-screen images and the one opened, null when closed
  const [fullScreen, setFullScreen] = useState<{
    images: IGalleryImage[];
    index: number;
  } | null>(null);
  // Thumbnail that opened the gallery; focus returns to it on close
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // Off-screen slides sit next to the visible one, inside the browser's lazy-load margin, so every
  // photo of every card would download on page load. Only the current and adjacent slides get an image.
  const [activeIndex, setActiveIndex] = useState(0);

  const open = (index: number) =>
    setFullScreen({
      index,
      images: photos.map((photo, i) => ({
        id: photo.id,
        src: getFullScreenSrc(photo),
        alt: `${title} - Image ${i + 1}`,
        blurDataURL: photo.blurDataURL,
      })),
    });

  return (
    <>
      <Swiper
        modules={[Navigation, A11y]}
        navigation
        a11y={{ prevSlideMessage: "Previous image", nextSlideMessage: "Next image" }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="text-primary h-full w-full p-0"
      >
        {photos.map((photo, index) => (
          <SwiperSlide key={photo.id}>
            <button
              type="button"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                open(index);
              }}
              aria-label={`Open gallery: ${title}, image ${index + 1} of ${photos.length}`}
              className="group relative block h-full w-full cursor-pointer overflow-hidden focus-visible:outline-none"
            >
              {Math.abs(index - activeIndex) <= 1 ? (
                // `large` is plenty for a card (at most ~510px wide) and much lighter for the optimizer
                <Image
                  src={photo.large?.url ?? photo.url}
                  alt={title || ""}
                  width={800}
                  height={450}
                  sizes={THUMBNAIL_SIZES}
                  blurDataURL={photo.blurDataURL}
                  placeholder={photo.blurDataURL ? "blur" : "empty"}
                  className="aspect-video object-cover object-center transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105"
                />
              ) : (
                <span aria-hidden="true" className="block aspect-video" />
              )}
              {/* Hover cue and keyboard focus indicator; an outline blends into the primary card header */}
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <span className="bg-primary flex size-12 items-center justify-center rounded-full text-white shadow-md">
                  <LuExpand size={22} />
                </span>
              </span>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
      {fullScreen && (
        <FullScreenGallery
          images={fullScreen.images}
          title={title}
          initialIndex={fullScreen.index}
          returnFocusRef={triggerRef}
          onClose={() => setFullScreen(null)}
        />
      )}
    </>
  );
}
