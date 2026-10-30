"use client";

import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

// Mouse (or trackpad) users on the desktop layout only, never with reduced motion. Matches the
// primary pointer, so touchscreen laptops still get the rocket.
const ROCKET_QUERY =
  "(pointer: fine) and (min-width: 769px) and (prefers-reduced-motion: no-preference)";

const MOUSE_MARGIN = 5;
// Fumes come from a fixed pool reused round-robin: one every 50ms, each fading out over 1s, so
// about 20 are visible at once and the DOM never changes while the rocket flies.
const FUME_POOL_SIZE = 20;
const FUME_INTERVAL_MS = 50;
const FUME_LIFETIME_MS = 1000;
// Each puff is a 30px circle scaled down to its random 10-30px size. The old per-puff
// `box-shadow: 0 0 100px #ffffff20` is gone: a blur that wide spreads a puff this small to ~1%
// alpha (measured at most 2/255 brighter on the dark theme), but it was expensive to paint.
const FUME_SIZE = 30;

export default function RocketCursor() {
  const enabled = useMediaQuery(ROCKET_QUERY);
  const rocketRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const fumeRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const rocket = rocketRef.current;
    const heart = heartRef.current;
    const fumes = fumeRefs.current.filter((fume): fume is HTMLSpanElement => fume !== null);

    if (!rocket || !heart) return;

    const rocketBoundingRect = rocket.getBoundingClientRect();
    const rocketWidth = rocketBoundingRect.width;
    const rocketHeight = rocketBoundingRect.height;
    let rocketX = rocketBoundingRect.left;
    let rocketY = rocketBoundingRect.top;
    let angle = 0;
    let mouseX = 0;
    let mouseY = 0;
    let hasMouse = false;
    let oldTimeStamp = 1;
    let frameId = 0;
    let fumeClock = 0;
    let nextFume = 0;
    let lastTransform = "";
    let heartVisible = false;
    const fumeAnimations: (Animation | undefined)[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      hasMouse = true;
    };

    // Puff at the nozzle (bottom centre of the rotated rocket box), drifting 10px further back
    const spawnFume = () => {
      const index = nextFume;
      const fume = fumes[index];
      nextFume = (nextFume + 1) % fumes.length;
      if (!fume) return;

      const size = Math.random() * 20 + 10;
      const radians = (angle * Math.PI) / 180;
      const sin = Math.sin(radians);
      const cos = Math.cos(radians);
      const back = rocketHeight / 2 - size / 2;
      const x = rocketX + (Math.random() * 8 - 4) + rocketWidth / 2 - back * sin - FUME_SIZE / 2;
      const y = rocketY + rocketHeight / 2 + back * cos - FUME_SIZE / 2;
      const scale = `scale(${size / FUME_SIZE})`;

      fumeAnimations[index]?.cancel();
      // Opacity and transform only, so the browser runs it on the compositor
      fumeAnimations[index] = fume.animate(
        [
          { opacity: 0.6, transform: `translate(${x}px, ${y}px) ${scale}` },
          { opacity: 0, transform: `translate(${x - 10 * sin}px, ${y + 10 * cos}px) ${scale}` },
        ],
        { duration: FUME_LIFETIME_MS, easing: "ease-in" },
      );
    };

    const loop = (timeStamp: number) => {
      const elapsed = timeStamp - oldTimeStamp;
      oldTimeStamp = timeStamp;
      const fps = Math.max(1, Math.min(Math.round(1000 / elapsed), 200));

      // Each frame covers 1/fps of the distance, unless the rocket already sits on the pointer
      let xSpeed = 0;
      let ySpeed = 0;
      const onPointer =
        rocketY + rocketHeight > mouseY - MOUSE_MARGIN &&
        rocketX + rocketWidth > mouseX - MOUSE_MARGIN &&
        rocketY < mouseY + MOUSE_MARGIN &&
        rocketX < mouseX + MOUSE_MARGIN;

      if (!onPointer) {
        xSpeed = Math.abs(rocketX - mouseX) / fps;
        ySpeed = Math.abs(rocketY - mouseY) / fps;
        rocketX += rocketX > mouseX ? -xSpeed : xSpeed;
        rocketY += rocketY > mouseY ? -ySpeed : ySpeed;
      }

      angle =
        Math.atan2(mouseX - (rocketX + rocketWidth / 2), -(mouseY - (rocketY + rocketHeight / 2))) *
        (180 / Math.PI);

      const transform = `translate(${rocketX}px, ${rocketY}px) rotate(${angle}deg)`;
      if (transform !== lastTransform) {
        rocket.style.transform = transform;
        lastTransform = transform;
      }

      fumeClock += elapsed;
      if (fumeClock >= FUME_INTERVAL_MS) {
        fumeClock %= FUME_INTERVAL_MS;
        spawnFume();
      }

      const showHeart = xSpeed < 0.1 && ySpeed < 0.1 && hasMouse;
      if (showHeart !== heartVisible) {
        heart.style.opacity = showHeart ? "1" : "0";
        heartVisible = showHeart;
      }

      frameId = window.requestAnimationFrame(loop);
    };

    document.addEventListener("mousemove", handleMouseMove);
    frameId = window.requestAnimationFrame(loop);

    // Stop the loop too, otherwise every time the media query flips on another one starts
    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("mousemove", handleMouseMove);
      fumeAnimations.forEach((animation) => animation?.cancel());
    };
  }, [enabled]);

  if (!enabled) return null;

  // will-change keeps the rocket (and its large glow) on its own layer, so moving it each frame
  // doesn't repaint the page underneath
  return (
    <>
      {Array.from({ length: FUME_POOL_SIZE }, (_, index) => (
        <span
          key={index}
          ref={(fume) => {
            fumeRefs.current[index] = fume;
          }}
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-(--z-cursor-trail) rounded-full bg-white opacity-0"
          style={{ width: FUME_SIZE, height: FUME_SIZE }}
        />
      ))}
      <div
        className="rocket pointer-events-none will-change-transform select-none"
        ref={rocketRef}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 44" className="fill-primary!">
          <path d="M16 0C16 0 25 4.08 25 21C25 25.98 22.92 32.14 21.8 35H10.2C9.08 32.14 7 25.98 7 21C7 4.08 16 0 16 0ZM20 17C20 14.8 18.2 13 16 13C13.8 13 12 14.8 12 17C12 19.2 13.8 21 16 21C18.2 21 20 19.2 20 17ZM7.38 36.04C6.42 33.58 4.34 27.7 4.04 22.3L1.78 23.8C0.66 24.56 0 25.8 0 27.14V39L7.38 36.04ZM32 39V27.14C32 25.8 31.34 24.56 30.22 23.82L27.96 22.32C27.66 27.7 25.56 33.6 24.62 36.06L32 39Z" />
        </svg>
        <div className="glow shadow-primary"></div>
        <div className="heart" ref={heartRef}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="icon icon-tabler icons-tabler-filled icon-tabler-heart"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path
              fill="#dd2d4a"
              d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
