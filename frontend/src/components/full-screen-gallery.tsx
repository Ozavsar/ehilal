import type { RefObject } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard, Navigation } from "swiper/modules";
import { LuX } from "react-icons/lu";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/a11y";

export interface IGalleryImage {
  id: string | number;
  src: string;
  alt: string;
  blurDataURL?: string;
}

interface FullScreenGalleryProps {
  images: IGalleryImage[];
  title: string;
  initialIndex: number;
  returnFocusRef: RefObject<HTMLElement | null>;
  onClose: () => void;
}

export default function FullScreenGallery({
  images,
  title,
  initialIndex,
  returnFocusRef,
  onClose,
}: FullScreenGalleryProps) {
  // Radix Dialog handles Escape, focus trap, scroll lock and the dialog role; --z-modal sits above
  // the header, the drawer and the article TOC button.
  // data-lenis-prevent stops Lenis from scrolling the page behind the dialog.
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-black" />
        <Dialog.Content
          aria-describedby={undefined}
          data-lenis-prevent
          onCloseAutoFocus={(event) => {
            // No Dialog.Trigger here, so Radix can't restore focus by itself
            event.preventDefault();
            returnFocusRef.current?.focus({ preventScroll: true });
          }}
          className="fixed inset-0 z-(--z-modal) flex items-center justify-center focus:outline-none"
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <Dialog.Close
            className="text-primary hover:text-foreground absolute top-4 right-4 z-(--z-floating)"
            aria-label="Close full screen image"
          >
            <LuX size={24} />
          </Dialog.Close>
          <Swiper
            modules={[Navigation, Keyboard, A11y]}
            navigation
            keyboard={{ enabled: true }}
            initialSlide={initialIndex}
            a11y={{ prevSlideMessage: "Previous image", nextSlideMessage: "Next image" }}
            className="relative h-screen w-screen"
          >
            {images.map((image) => (
              <SwiperSlide key={image.id}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  // Each slide fills the viewport: pick the srcset entry by viewport width and DPR
                  fill
                  sizes="100vw"
                  blurDataURL={image.blurDataURL}
                  placeholder={image.blurDataURL ? "blur" : "empty"}
                  className="object-contain object-center"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
