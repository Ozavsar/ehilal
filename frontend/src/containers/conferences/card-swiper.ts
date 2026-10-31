// The conference card carousel, imported by gallery.tsx only once needed (not in the first load).
// Swiper takes over the slides and arrows React already rendered.
import Swiper from "swiper";
import { A11y, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/a11y";

interface CardSwiperOptions {
  prevEl: HTMLElement;
  nextEl: HTMLElement;
  speed: number;
  initialSlide: number;
  onSlideChange: (index: number) => void;
}

export function createCardSwiper(
  el: HTMLElement,
  { prevEl, nextEl, speed, initialSlide, onSlideChange }: CardSwiperOptions,
) {
  return new Swiper(el, {
    modules: [Navigation, A11y],
    navigation: { prevEl, nextEl },
    speed,
    initialSlide,
    a11y: { prevSlideMessage: "Previous image", nextSlideMessage: "Next image" },
    on: { slideChange: (swiper) => onSlideChange(swiper.activeIndex) },
  });
}
