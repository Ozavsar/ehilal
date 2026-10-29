"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { A11y, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { LuExpand } from "react-icons/lu";
import FullScreenGallery from "@/components/full-screen-gallery";
import type { IImage } from "@/types";
import "swiper/css/a11y";

interface Props {
  images: IImage[];
  title: string;
}

export default function Gallery({ images, title }: Props) {
  // Index of the image opened in full screen, null when closed
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Thumbnail that opened the gallery; focus returns to it on close
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // The media field may hold non-image uploads, which next/image can't render
  const photos = images.filter((image) => image.mime?.startsWith("image/"));

  return (
    <>
      <Swiper
        modules={[Navigation, A11y]}
        navigation
        a11y={{ prevSlideMessage: "Previous image", nextSlideMessage: "Next image" }}
        className="text-primary h-full w-full p-0"
      >
        {photos.map((image, index) => (
          <SwiperSlide key={image.id}>
            <button
              type="button"
              onClick={(event) => {
                triggerRef.current = event.currentTarget;
                setOpenIndex(index);
              }}
              aria-label={`Open gallery: ${title}, image ${index + 1} of ${photos.length}`}
              className="group relative block h-full w-full cursor-pointer overflow-hidden focus-visible:outline-none"
            >
              <Image
                src={image.url}
                alt={title || ""}
                width={800}
                height={800}
                blurDataURL={image.blurDataURL ? image.blurDataURL : undefined}
                placeholder={image.blurDataURL ? "blur" : "empty"}
                className="aspect-video object-cover object-center transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105"
              />
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
      {openIndex !== null && (
        <FullScreenGallery
          images={photos.map((image, index) => ({
            id: image.id,
            src: image.url,
            alt: `${title} - Image ${index + 1}`,
            blurDataURL: image.blurDataURL,
          }))}
          title={title}
          initialIndex={openIndex}
          returnFocusRef={triggerRef}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
