import { ViewTransition, type RefObject } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard, Navigation } from "swiper/modules";
import { Icon } from "@/components/icon";
import { useSlideSpeed } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/a11y";

export interface IGalleryImage {
  id: string | number;
  src: string;
  alt: string;
  blurDataURL?: string;
  // Shared with the thumbnail that opened it, so the photo morphs between the two (view transition)
  transitionName?: string;
  // Original size: the image box then fits the photo exactly (a clean morph), else it fills the slide
  width?: number | null;
  height?: number | null;
}

interface FullScreenGalleryProps {
  images: IGalleryImage[];
  title: string;
  initialIndex: number;
  returnFocusRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  // The photo morphs out of its thumbnail: no scale-in of its own
  morph?: boolean;
}

export default function FullScreenGallery({
  images,
  title,
  initialIndex,
  returnFocusRef,
  onClose,
  onIndexChange,
  morph = false,
}: FullScreenGalleryProps) {
  const slideSpeed = useSlideSpeed();
  // Radix Dialog handles Escape, focus trap, scroll lock and the dialog role; --z-modal sits above
  // the header, the drawer and the article TOC button.
  // data-lenis-prevent stops Lenis from scrolling the page behind the dialog.
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      {/* An explicit container renders the portal in the same commit as the dialog (Radix waits a
          layout effect for document.body otherwise), so a view transition sees the photo enter.
          This component only renders on the client. */}
      <Dialog.Portal container={document.body}>
        {/* M3 fade: the scrim fades in, the gallery fades in while it scales up (or the photo
            morphs out of its thumbnail) */}
        <Dialog.Overlay className="bg-scrim animate-m3-scrim-enter fixed inset-0 z-(--z-modal)" />
        <Dialog.Content
          aria-describedby={undefined}
          data-lenis-prevent
          onCloseAutoFocus={(event) => {
            // No Dialog.Trigger here, so Radix can't restore focus by itself
            event.preventDefault();
            returnFocusRef.current?.focus({ preventScroll: true });
          }}
          className={cn(
            "fixed inset-0 z-(--z-modal) flex items-center justify-center focus:outline-none",
            !morph && "animate-m3-fade-enter",
          )}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Close
            // M3 standard icon button (48dp touch target). Fixed roles keep the same light tone in
            // both themes, readable on the black scrim
            className="state-layer text-primary-fixed-dim outline-primary-fixed-dim absolute top-4 right-4 z-(--z-floating) inline-flex size-12 cursor-pointer items-center justify-center rounded-full focus-visible:outline-3 focus-visible:outline-offset-2"
            aria-label="Close full screen image"
          >
            <Icon name="close" />
          </Dialog.Close>
          <Swiper
            modules={[Navigation, Keyboard, A11y]}
            navigation
            keyboard={{ enabled: true }}
            speed={slideSpeed}
            initialSlide={initialIndex}
            onSlideChange={(swiper) => onIndexChange?.(swiper.activeIndex)}
            a11y={{ prevSlideMessage: "Previous image", nextSlideMessage: "Next image" }}
            className="relative h-screen w-screen"
          >
            {images.map((image) => (
              <SwiperSlide key={image.id} className="flex! items-center justify-center">
                {/* Without a transitionName this boundary never animates */}
                <ViewTransition name={image.transitionName} share="photo-morph" default="none">
                  {image.width && image.height ? (
                    // Contained by max size, so the box is the photo itself
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      sizes="100vw"
                      blurDataURL={image.blurDataURL}
                      placeholder={image.blurDataURL ? "blur" : "empty"}
                      className="h-auto max-h-full w-auto max-w-full object-contain select-none"
                      draggable={false}
                    />
                  ) : (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      // Each slide fills the viewport: pick the srcset entry by viewport width and DPR
                      fill
                      sizes="100vw"
                      blurDataURL={image.blurDataURL}
                      placeholder={image.blurDataURL ? "blur" : "empty"}
                      className="object-contain object-center select-none"
                      draggable={false}
                    />
                  )}
                </ViewTransition>
              </SwiperSlide>
            ))}
          </Swiper>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
