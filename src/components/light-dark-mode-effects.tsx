"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useRef } from "react";

export default function LightDarkModeEffects() {
  const { theme } = useTheme();

  const birdRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const bird = birdRef.current;

    if (theme === "light" && bird) {
      // Trigger the animation
      bird.style.display = "block";

      // Remove the bird after the animation
      const timeout = setTimeout(() => {
        bird.style.display = "none";
      }, 5000); // Matches the animation duration

      return () => clearTimeout(timeout);
    }
  }, [theme]);

  return (
    <>
      <Image
        ref={birdRef}
        src="/images/home/blue-bird.png"
        width={256}
        height={256}
        alt="Flying bird"
        className="flying-bird"
      />
    </>
  );
}
