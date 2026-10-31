"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import {
  addTransitionType,
  startTransition,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  ViewTransition,
} from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Icon } from "@/components/icon";
import { GALLERY, GALLERY_CLOSE, GALLERY_OPEN } from "@/components/view-transitions";
import type { IGalleryImage } from "@/components/full-screen-gallery";
import { useIdleAfterLoad } from "@/hooks/use-idle-after-load";
import { useSlideSpeed } from "@/hooks/use-media-query";
import { LIST_CARD_IMAGE_SIZES } from "@/containers/list-layout";

// Loaded when a photo is first opened
const FullScreenGallery = dynamic(() => import("@/components/full-screen-gallery"));
// Swiper and its CSS load only once a card carousel is needed (see `active` below)
const loadCardSwiper = () => import("./card-swiper");

// Cards this close to the viewport get their carousel once the page is idle, ready before a swipe
const CAROUSEL_ROOT_MARGIN = "200px 0px";

// Swiper's arrow styles, so the card looks the same before Swiper's CSS loads (rest in globals.css)
const ARROW_CLASS_NAME =
  "absolute z-10 flex cursor-pointer items-center justify-center [&.swiper-button-disabled]:pointer-events-none [&.swiper-button-disabled]:cursor-auto [&.swiper-button-disabled]:opacity-35";

// Swiper's chevron. A transform, not `rotate-*`: Swiper's CSS also transforms the previous arrow
// and the two would add up.
function ArrowIcon({ previous = false }: { previous?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="11"
      height="20"
      viewBox="0 0 11 20"
      fill="none"
      className={
        previous
          ? "swiper-navigation-icon pointer-events-none transform-[rotate(180deg)]"
          : "swiper-navigation-icon pointer-events-none"
      }
    >
      <path
        d="M0.38296 20.0762C0.111788 19.805 0.111788 19.3654 0.38296 19.0942L9.19758 10.2796L0.38296 1.46497C0.111788 1.19379 0.111788 0.754138 0.38296 0.482966C0.654131 0.211794 1.09379 0.211794 1.36496 0.482966L10.4341 9.55214C10.8359 9.9539 10.8359 10.6053 10.4341 11.007L1.36496 20.0762C1.09379 20.3474 0.654131 20.3474 0.38296 20.0762Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
  // First card: its cover is the likely LCP image, preloaded from the <head> (measured better than
  // eager + fetchPriority="high")
  priority?: boolean;
}

// Largest on-screen upscale (in device pixels) of the `large` format before the original is used
const MAX_LARGE_UPSCALE = 1.25;

// The light `large` format on small screens, the original on big or high-density ones
function getFullScreenSrc({ url, large }: IConferencePhoto): string {
  if (!large) return url;
  const containScale = Math.min(window.innerWidth / large.width, window.innerHeight / large.height);
  return containScale * window.devicePixelRatio <= MAX_LARGE_UPSCALE ? large.url : url;
}

// Unique per conference and photo: the same upload can appear on two cards
const photoTransitionName = (conferenceId: number, photo: IConferencePhoto) =>
  `conference-${conferenceId}-photo-${photo.id}`;

// Opening and closing are transitions, so the photo morphs between its thumbnail and full screen
function galleryTransition(type: typeof GALLERY_OPEN | typeof GALLERY_CLOSE, update: () => void) {
  startTransition(() => {
    addTransitionType(GALLERY);
    addTransitionType(type);
    update();
  });
}

// The open gallery has its own same-URL history entry, so Back closes it and Forward reopens it
const HISTORY_KEY = "conferenceGallery";
type GalleryEntry = { conferenceId: number; index: number };
const galleryEntry = (state: unknown) =>
  (state as Record<string, GalleryEntry | undefined> | null)?.[HISTORY_KEY];

export default function Gallery({ conferenceId, photos, title, priority = false }: Props) {
  // null when closed
  const [fullScreen, setFullScreen] = useState<{
    images: IGalleryImage[];
    index: number;
    morph: boolean;
  } | null>(null);
  // Swiper (null until then) takes over the card's markup once active
  const swiperElRef = useRef<HTMLDivElement>(null);
  const prevElRef = useRef<HTMLDivElement>(null);
  const nextElRef = useRef<HTMLDivElement>(null);
  const cardSwiperRef = useRef<SwiperInstance | null>(null);
  // The next arrow was clicked before Swiper was ready
  const pendingNextRef = useRef(false);
  // Thumbnail of the photo shown full screen; focus returns to it on close
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Static markup until pointed at, focused, opened or near the viewport once idle: a Swiper per
  // card during hydration blocked the main thread on mobile
  const hasCarousel = photos.length > 1;
  const [active, setActive] = useState(false);
  const activate = () => {
    if (hasCarousel) setActive(true);
  };
  // Only the current slide gets an image (plus its neighbours once active): off-screen slides sit
  // inside the lazy-load margin and would all download on page load
  const [activeIndex, setActiveIndex] = useState(0);
  const idle = useIdleAfterLoad();
  const slideSpeed = useSlideSpeed();

  // The card follows the full-screen gallery so closing morphs into a visible slide; focus returns
  // to that slide, or Swiper's a11y module would slide back to the opener mid-transition
  const showInCard = (index: number) => {
    triggerRef.current = thumbnailRefs.current[index] ?? triggerRef.current;
    // Also the starting slide when a screen reader's click opens the gallery before activation
    setActiveIndex(index);
    activate();
    cardSwiperRef.current?.slideTo(index, 0);
  };

  useEffect(() => {
    const el = swiperElRef.current;
    if (!hasCarousel || active || !idle || !el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setActive(true);
      },
      { rootMargin: CAROUSEL_ROOT_MARGIN },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasCarousel, active, idle]);

  // Reads the latest speed and slide when Swiper is created, after its module has loaded
  const createSwiper = useEffectEvent((create: typeof import("./card-swiper").createCardSwiper) => {
    const el = swiperElRef.current;
    const prevEl = prevElRef.current;
    const nextEl = nextElRef.current;
    if (!el || !prevEl || !nextEl) return null;
    const swiper = create(el, {
      prevEl,
      nextEl,
      speed: slideSpeed,
      initialSlide: activeIndex,
      onSlideChange: setActiveIndex,
    });
    if (pendingNextRef.current) swiper.slideNext();
    pendingNextRef.current = false;
    return swiper;
  });

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    loadCardSwiper().then(({ createCardSwiper }) => {
      // One task per card, so cards that come into view together don't make one long task
      setTimeout(() => {
        if (!cancelled) cardSwiperRef.current = createSwiper(createCardSwiper);
      });
    });
    return () => {
      cancelled = true;
      cardSwiperRef.current?.destroy();
      cardSwiperRef.current = null;
    };
  }, [active]);

  // Reduced motion can change while the page is open
  useEffect(() => {
    if (cardSwiperRef.current) cardSwiperRef.current.params.speed = slideSpeed;
  }, [slideSpeed]);

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

  // Capture phase, ahead of Next's listener. Deferred a task: React commits popstate updates
  // synchronously, without a view transition.
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
      {/* Swiper's markup. Class names never change: React would drop the ones Swiper adds. */}
      <div
        ref={swiperElRef}
        onPointerEnter={activate}
        onFocus={activate}
        className="swiper swiper-horizontal bg-surface-container-highest relative h-full w-full overflow-hidden p-0"
      >
        <div className="swiper-wrapper relative flex h-full w-full">
          {photos.map((photo, index) => (
            <div key={photo.id} className="swiper-slide relative h-full w-full shrink-0">
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
                  // Full-screen photos own the names while open; the new key remounts the thumbnail
                  // so React pairs the two and no name is mounted twice
                  key={fullScreen ? "full-screen" : "card"}
                  name={fullScreen ? undefined : photoTransitionName(conferenceId, photo)}
                  share="photo-morph"
                  default="none"
                >
                  {/* The morph's starting box: the slide, not the image scaled on hover */}
                  <span className="block overflow-hidden">
                    {Math.abs(index - activeIndex) <= (active ? 1 : 0) ? (
                      // `large` is plenty for a card (at most ~570px wide)
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
            </div>
          ))}
        </div>
        {hasCarousel && (
          <>
            <div
              ref={prevElRef}
              className={`swiper-button-prev swiper-button-disabled left-(--swiper-navigation-sides-offset) ${ARROW_CLASS_NAME}`}
            >
              <ArrowIcon previous />
            </div>
            <div
              ref={nextElRef}
              // Swiper handles the clicks once it is ready
              onClick={() => {
                if (cardSwiperRef.current) return;
                pendingNextRef.current = true;
                setActive(true);
              }}
              className={`swiper-button-next right-(--swiper-navigation-sides-offset) ${ARROW_CLASS_NAME}`}
            >
              <ArrowIcon />
            </div>
          </>
        )}
      </div>
      {fullScreen && (
        <FullScreenGallery
          // Every photo keeps its name (a changing name would be tracked as a duplicate); React
          // only pairs the one on screen
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
