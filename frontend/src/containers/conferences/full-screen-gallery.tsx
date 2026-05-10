import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { LuX } from "react-icons/lu";
import type { IImage } from "@/types";

interface FullScreenImageProps {
  images: IImage[];
  title: string;
  onClose: () => void;
}

export default function FullScreenImage({ images, title, onClose }: FullScreenImageProps) {
  return (
    <div className="bg-opacity-90 fixed inset-0 z-40 mt-0! flex items-center justify-center bg-black backdrop-blur-sm">
      <button
        onClick={onClose}
        className="text-primary hover:text-foreground absolute top-4 right-4 z-50"
        aria-label="Close full screen image"
      >
        <LuX size={24} />
      </button>
      <Swiper modules={[Navigation]} navigation className="relative h-screen w-screen">
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <Image
              src={image.url}
              alt={`${title} - Image ${index + 1}`}
              width={1920}
              height={1920}
              blurDataURL={image.blurDataURL ? image.blurDataURL : ""}
              placeholder={image.blurDataURL ? "blur" : "empty"}
              className="h-full w-full object-contain object-center"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
