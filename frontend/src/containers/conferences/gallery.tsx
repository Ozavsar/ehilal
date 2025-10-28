"use client";

import Image from "next/image";
import { useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import FullScreenGallery from "./full-screen-gallery";
import type { IImage } from "@/types";

interface Props {
  images: IImage[];
  title: string;
}

export default function Gallery({ images, title }: Props) {
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const openFullScreen = (image: string) => {
    setFullScreenImage(image);
  };

  const closeFullScreen = () => {
    setFullScreenImage(null);
  };
  return (
    <>
      <Swiper
        modules={[Navigation]}
        navigation
        className="h-full w-full text-primary"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <Image
              src={image.url}
              alt={title || ""}
              width={800}
              height={800}
              blurDataURL={image.blurDataURL ? image.blurDataURL : undefined}
              placeholder={image.blurDataURL ? "blur" : "empty"}
              onClick={() => openFullScreen(image.formats.large.url)}
              className="aspect-video cursor-pointer object-cover object-center"
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {fullScreenImage && (
        <FullScreenGallery
          images={images}
          title={title}
          onClose={closeFullScreen}
        />
      )}
    </>
  );
}
