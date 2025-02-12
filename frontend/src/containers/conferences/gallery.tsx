"use client";

import Image, { StaticImageData } from "next/image";
import { useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import FullScreenGallery from "./full-screen-gallery";

interface Props {
  images: StaticImageData[];
  title: string;
}

export default function Gallery({ images, title }: Props) {
  const [fullScreenImage, setFullScreenImage] =
    useState<StaticImageData | null>(null);

  const openFullScreen = (image: StaticImageData) => {
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
              src={image}
              alt={title || ""}
              width={800}
              height={800}
              onClick={() => openFullScreen(image)}
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
