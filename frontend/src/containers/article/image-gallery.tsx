"use client";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@/components/icon";
import type { IGalleryImage } from "@/components/full-screen-gallery";
import { cn } from "@/lib/utils";

// Swiper's JS and CSS load when a reader first opens an image, not with the article
const FullScreenGallery = dynamic(() => import("@/components/full-screen-gallery"));

// Opens the shared gallery at an image; focus returns to the trigger button on close
type OpenGallery = (index: number, trigger: HTMLButtonElement) => void;

const GalleryContext = createContext<OpenGallery | null>(null);

// One full-screen gallery for all images of the article
export function ImageGalleryProvider({
  images,
  title,
  children,
}: {
  images: IGalleryImage[];
  title: string;
  children: ReactNode;
}) {
  // Index of the image opened in full screen, null when closed
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const openGallery: OpenGallery = (index, trigger) => {
    triggerRef.current = trigger;
    setOpenIndex(index);
  };

  return (
    <GalleryContext value={openGallery}>
      {children}
      {openIndex !== null && (
        <FullScreenGallery
          images={images}
          title={title}
          initialIndex={openIndex}
          returnFocusRef={triggerRef}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </GalleryContext>
  );
}

interface ZoomButtonProps {
  index: number; // position in the provider's images
  label: string;
  className?: string;
  children: ReactNode; // the image
}

// Opens the gallery at its image; shared by the inline images and the article cover
export function ZoomButton({ index, label, className, children }: ZoomButtonProps) {
  const openGallery = useContext(GalleryContext);

  return (
    <button
      type="button"
      onClick={(event) => openGallery?.(index, event.currentTarget)}
      aria-label={label}
      className={cn(
        "not-prose group focus-visible:outline-primary relative mx-auto my-8 block cursor-zoom-in overflow-hidden rounded-md focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
    >
      {children}
      {/* Hover cue and keyboard focus indicator, same as the card thumbnails */}
      <span
        aria-hidden="true"
        className="bg-scrim/40 ease-standard absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <span className="bg-primary text-on-primary shadow-elevation-2 flex size-12 items-center justify-center rounded-full">
          <Icon name="zoom_in" />
        </span>
      </span>
    </button>
  );
}

interface ZoomableImageProps {
  index: number; // position in the provider's images
  src: string;
  alt: string;
  label: string;
  // Rendered pixel size, reserves the image's box before it loads (no layout shift)
  width?: number;
  height?: number;
  // Lead image at the top of the article: load it eagerly at high priority, the rest lazily
  lead?: boolean;
}

export function ZoomableImage({ index, src, alt, label, width, height, lead }: ZoomableImageProps) {
  return (
    <ZoomButton index={index} label={label}>
      {/* eslint-disable-next-line @next/next/no-img-element -- Medium CDN image, sized by its URL */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={lead ? "eager" : "lazy"}
        fetchPriority={lead ? "high" : undefined}
        decoding="async"
        className="ease-standard transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none"
      />
    </ZoomButton>
  );
}
