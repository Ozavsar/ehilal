"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

interface AnimatedImageProps {
  poster: string;
  posterSrcSet?: string;
  sizes?: string;
  /** The animation itself (a GIF can weigh tens of megabytes): only requested on play */
  src: string;
  alt: string;
  // Rendered pixel size: reserves the box before the poster loads
  width?: number;
  height?: number;
  playLabel: string;
  pauseLabel: string;
  className?: string;
}

// Click-to-play facade for animated GIFs: nothing heavy loads until played, and a playing
// animation can be paused again (WCAG 2.2.2)
export default function AnimatedImage({
  poster,
  posterSrcSet,
  sizes,
  src,
  alt,
  width,
  height,
  playLabel,
  pauseLabel,
  className,
}: AnimatedImageProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <span
      className={cn(
        "not-prose bg-surface-container relative mx-auto my-8 block w-fit max-w-full overflow-hidden rounded-md",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- Medium/Giphy CDN image, sized by its URL */}
      <img
        src={playing ? src : poster}
        srcSet={playing ? undefined : posterSrcSet}
        sizes={playing ? undefined : sizes}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="block h-auto max-w-full object-cover"
      />
      {/* M3 FAB in the middle while still, a small icon button in the corner while playing */}
      <button
        type="button"
        onClick={() => setPlaying((value) => !value)}
        aria-label={playing ? pauseLabel : playLabel}
        className={cn(
          "state-layer bg-primary text-on-primary shadow-elevation-2 absolute flex items-center justify-center rounded-full",
          "focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2",
          playing ? "touch-target inset-e-3 bottom-3 size-10" : "inset-0 m-auto size-14",
        )}
      >
        <Icon name={playing ? "pause" : "play_arrow"} />
      </button>
    </span>
  );
}
