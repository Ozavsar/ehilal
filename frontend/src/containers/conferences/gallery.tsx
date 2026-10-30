"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import {
  addTransitionType,
  startTransition,
  useEffect,
  useRef,
  useState,
  ViewTransition,
} from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Icon } from "@/components/icon";
import { GALLERY, GALLERY_CLOSE, GALLERY_OPEN } from "@/components/view-transitions";
import type { IGalleryImage } from "@/components/full-screen-gallery";
import { useIdleAfterLoad } from "@/hooks/use-idle-after-load";
import { useSlideSpeed } from "@/hooks/use-media-query";
import { LIST_CARD_IMAGE_SIZES } from "@/containers/list-layout";
// Swiper styles for the card slider and the full-screen gallery it opens
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/a11y";

// The dialog (Radix) and the keyboard module load when a visitor first opens a photo
const FullScreenGallery = dynamic(() => import("@/components/full-screen-gallery"));

export interface IConferencePhoto {
  id: number;
  url: string;
  blurDataURL?: string;
  width: number | null;
  height: number | null;
  // Strapi's `large` format (1000px on the long side), absent for smaller originals
  large?: { url: string; width: number; height: number };
}

interface Props {
  conferenceId: number;
  photos: IConferencePhoto[];
  title: string;
  // First card on the page: its cover is the likely LCP element, so it is preloaded from the <head>.
  // Measured against eager + fetchPriority="high" (worse simulated LCP), fetchPriority alone and
  // plain lazy loading: same simulated LCP, but the preload paints it earliest in a real load.
  priority?: boolean;
}

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

// Unique per conference and photo: the same upload can appear on two cards
const photoTransitionName = (conferenceId: number, photo: IConferencePhoto) =>
  `conference-${conferenceId}-photo-${photo.id}`;

// Opening and closing are transitions, so the photo morphs between its thumbnail and full screen
// (React <ViewTransition>; without browser support the gallery just opens and closes)
function galleryTransition(type: typeof GALLERY_OPEN | typeof GALLERY_CLOSE, update: () => void) {
  startTransition(() => {
    addTransitionType(GALLERY);
    addTransitionType(type);
    update();
  });
}

// The open gallery has its own history entry (same URL, marked in history.state), so the
// browser's Back button closes it and Forward opens it again
const HISTORY_KEY = "conferenceGallery";
type GalleryEntry = { conferenceId: number; index: number };
const galleryEntry = (state: unknown) =>
  (state as Record<string, GalleryEntry | undefined> | null)?.[HISTORY_KEY];

export default function Gallery({ conferenceId, photos, title, priority = false }: Props) {
  // Full-screen images and the one opened, null when closed
  const [fullScreen, setFullScreen] = useState<{
    images: IGalleryImage[];
    index: number;
    morph: boolean;
  } | null>(null);
  const cardSwiperRef = useRef<SwiperInstance | null>(null);
  // Thumbnail of the photo shown full screen; focus returns to it on close
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Off-screen slides sit next to the visible one, inside the browser's lazy-load margin, so every
  // photo of every card would download on page load. Only the current slide gets an image, plus the
  // adjacent ones once the page is idle (they would compete with the visible covers before that).
  const [activeIndex, setActiveIndex] = useState(0);
  const preloadNeighbours = useIdleAfterLoad();
  const slideSpeed = useSlideSpeed();

  // The card follows the full-screen gallery, so closing morphs the photo back into a visible
  // slide. Focus returns to that slide's button too: Swiper's a11y module would otherwise slide
  // back to the one that opened the gallery as it gets focus, mid-transition.
  const showInCard = (index: number) => {
    triggerRef.current = thumbnailRefs.current[index] ?? triggerRef.current;
    cardSwiperRef.current?.slideTo(index, 0);
  };

  const show = (index: number) => {
    showInCard(index);
    galleryTransition(GALLERY_OPEN, () => {
      setFullScreen({
        index,
        morph: typeof document.startViewTransition === "function",
        images: photos.map((photo, i) => ({
          id: photo.id,
          src: getFullScreenSrc(photo),
          alt: `${title} - Image ${i + 1}`,
          blurDataURL: photo.blurDataURL,
          transitionName: photoTransitionName(conferenceId, photo),
          width: photo.width,
          height: photo.height,
        })),
      });
    });
  };
  const hide = () => galleryTransition(GALLERY_CLOSE, () => setFullScreen(null));

  const open = (index: number) => {
    show(index);
    // Same URL: Next's patched pushState keeps its own state and doesn't navigate
    history.pushState({ [HISTORY_KEY]: { conferenceId, index } satisfies GalleryEntry }, "");
  };
  // Close button and Escape step back out of the gallery's entry; its popstate closes it
  const requestClose = () => {
    if (galleryEntry(history.state)?.conferenceId === conferenceId) history.back();
    else hide();
  };

  // Back/Forward into or out of this gallery's entry. Capture phase, ahead of Next's listener,
  // which has nothing to do for a same-URL step. The state change runs a task later: React commits
  // updates from a popstate event synchronously, without a view transition.
  const isOpen = fullScreen !== null;
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const entry = galleryEntry(event.state);
      const ours = entry?.conferenceId === conferenceId;
      if (isOpen === ours) return;
      event.stopImmediatePropagation();
      setTimeout(() => (entry && ours ? show(entry.index) : hide()));
    };
    window.addEventListener("popstate", onPopState, { capture: true });
    return () => window.removeEventListener("popstate", onPopState, { capture: true });
  });

  return (
    <>
      <Swiper
        modules={[Navigation, A11y]}
        navigation
        speed={slideSpeed}
        a11y={{ prevSlideMessage: "Previous image", nextSlideMessage: "Next image" }}
        onSwiper={(swiper) => {
          cardSwiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="bg-surface-container-highest h-full w-full p-0"
      >
        {photos.map((photo, index) => (
          <SwiperSlide key={photo.id}>
            <button
              ref={(button) => {
                thumbnailRefs.current[index] = button;
              }}
              type="button"
              onClick={() => open(index)}
              aria-label={`Open gallery: ${title}, image ${index + 1} of ${photos.length}`}
              className="group relative block h-full w-full cursor-pointer overflow-hidden focus-visible:outline-none"
            >
              <ViewTransition
                // While the gallery is open the full-screen photos have the names; the thumbnails
                // remount under another key, so React pairs the two on open and on close and no
                // name is mounted twice
                key={fullScreen ? "full-screen" : "card"}
                name={fullScreen ? undefined : photoTransitionName(conferenceId, photo)}
                share="photo-morph"
                default="none"
              >
                {/* The morph's starting box: the slide, not the image scaled on hover */}
                <span className="block overflow-hidden">
                  {Math.abs(index - activeIndex) <= (preloadNeighbours ? 1 : 0) ? (
                    // `large` is plenty for a card (at most ~570px wide) and much lighter for the optimizer
                    <Image
                      src={photo.large?.url ?? photo.url}
                      alt={title || ""}
                      width={800}
                      height={450}
                      sizes={LIST_CARD_IMAGE_SIZES}
                      preload={priority && index === 0}
                      blurDataURL={photo.blurDataURL}
                      placeholder={photo.blurDataURL ? "blur" : "empty"}
                      draggable={false}
                      className="ease-standard aspect-video object-cover object-center duration-300 select-none group-hover:scale-105 group-focus-visible:scale-105 motion-safe:transition-transform"
                    />
                  ) : (
                    <span aria-hidden="true" className="block aspect-video" />
                  )}
                </span>
              </ViewTransition>
              {/* Hover cue and keyboard focus indicator; the card clips a regular outline */}
              <span
                aria-hidden="true"
                className="bg-scrim/40 ease-standard absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <span className="bg-primary text-on-primary flex size-12 items-center justify-center rounded-full">
                  <Icon name="fullscreen" />
                </span>
              </span>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
      {fullScreen && (
        <FullScreenGallery
          // Every photo keeps its name (a name that changes between photos would be tracked as a
          // duplicate); React only pairs the one on screen, the other slides are outside the viewport
          images={fullScreen.images}
          title={title}
          initialIndex={fullScreen.index}
          returnFocusRef={triggerRef}
          morph={fullScreen.morph}
          onIndexChange={showInCard}
          onClose={requestClose}
        />
      )}
    </>
  );
}
