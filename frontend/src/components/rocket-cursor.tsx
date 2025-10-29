"use client";

import { useEffect, useRef, useState } from "react";

export default function RocketCursor() {
  const [isDesktop, setIsDesktop] = useState(false);
  const rocketRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(!("ontouchstart" in window) && window.innerWidth > 768);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const mouseMargin = 5;
    const body = document.body;
    const rocket = rocketRef.current;
    const heart = heartRef.current;

    if (!rocket || !heart) return;

    let angle = 0;
    let tick = 0;
    const fumeCount = 20;
    const rocketBoundingRect = rocket.getBoundingClientRect();
    const rocketWidth = rocketBoundingRect.width;
    const rocketHeight = rocketBoundingRect.height;
    let rocketPosition = {
      x: rocketBoundingRect.left,
      y: rocketBoundingRect.top,
    };
    let mousePosition = { x: 0, y: 0 };
    let oldTimeStamp = 1;
    let fps = 10;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosition = { x: e.clientX, y: e.clientY };
    };

    const calculateNewRocketPosition = (
      rocketX: number,
      rocketY: number,
      mouseX: number,
      mouseY: number,
      currentFps: number,
    ) => {
      let x = rocketX;
      let y = rocketY;
      let xSpeed = 0;
      let ySpeed = 0;

      if (
        rocketY + rocketHeight > mouseY - mouseMargin &&
        rocketX + rocketWidth > mouseX - mouseMargin &&
        rocketY < mouseY + mouseMargin &&
        rocketX < mouseX + mouseMargin
      ) {
        return { x, y, xSpeed, ySpeed };
      }

      const xDistance = Math.abs(rocketX - mouseX);
      const yDistance = Math.abs(rocketY - mouseY);
      xSpeed = xDistance / currentFps;
      ySpeed = yDistance / currentFps;

      x += rocketX > mouseX ? -xSpeed : xSpeed;
      y += rocketY > mouseY ? -ySpeed : ySpeed;

      return { x, y, xSpeed, ySpeed };
    };

    const loop = (timeStamp: number) => {
      const secondsPassed = (timeStamp - oldTimeStamp) / 1000;
      oldTimeStamp = timeStamp;

      fps = Math.round(1 / secondsPassed);
      fps = Math.max(1, Math.min(fps, 200));

      tick++;

      const { x, y, xSpeed, ySpeed } = calculateNewRocketPosition(
        rocketPosition.x,
        rocketPosition.y,
        mousePosition.x,
        mousePosition.y,
        fps,
      );

      if (!isNaN(x) && !isNaN(y)) {
        rocketPosition = { x, y };
      }

      const rocketCenter = {
        x: rocketPosition.x + rocketWidth / 2,
        y: rocketPosition.y + rocketHeight / 2,
      };

      angle =
        Math.atan2(
          mousePosition.x - rocketCenter.x,
          -(mousePosition.y - rocketCenter.y),
        ) *
        (180 / Math.PI);

      rocket.style.transform = `translate(${rocketPosition.x}px, ${rocketPosition.y}px) rotate(${angle}deg)`;
      body.style.backgroundPositionX = `-${rocketPosition.x / 10}px`;
      body.style.backgroundPositionY = `-${rocketPosition.y / 10}px`;

      if (tick % Math.floor(fps / fumeCount) === 0) {
        const div = document.createElement("div");
        div.style.cssText = `
          width: 32px; 
          height: 44px; 
          position: fixed; 
          top: ${rocketPosition.y}px; 
          left: ${rocketPosition.x + (Math.random() * 8 - 4)}px; 
          transform: rotate(${angle}deg); 
          display: flex; 
          align-items: flex-end; 
          justify-content: center;
          z-index: 7;
        `;

        const span = document.createElement("span");
        const fumeSize = Math.random() * 20 + 10;
        span.style.cssText = `
          width: ${fumeSize}px; 
          height: ${fumeSize}px; 
          border-radius: ${fumeSize}px; 
          background-color: white; 
          animation: fadeout 1s ease-in forwards; 
          opacity: 0.6; 
          box-shadow: 0 0 100px #ffffff20;
          z-index: 7;
        `;
        div.append(span);
        body.append(div);

        span.addEventListener("animationend", () => {
          div.remove();
        });
      }

      if (
        Math.abs(xSpeed) < 0.1 &&
        Math.abs(ySpeed) < 0.1 &&
        mousePosition.x !== 0
      ) {
        heart.style.opacity = "1";
      } else {
        heart.style.opacity = "0";
      }

      window.requestAnimationFrame(loop);
    };

    document.addEventListener("mousemove", handleMouseMove);
    window.requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <div className="rocket pointer-events-none select-none" ref={rocketRef}>
      <svg viewBox="0 0 32 44" className="!fill-primary">
        <path d="M16 0C16 0 25 4.08 25 21C25 25.98 22.92 32.14 21.8 35H10.2C9.08 32.14 7 25.98 7 21C7 4.08 16 0 16 0ZM20 17C20 14.8 18.2 13 16 13C13.8 13 12 14.8 12 17C12 19.2 13.8 21 16 21C18.2 21 20 19.2 20 17ZM7.38 36.04C6.42 33.58 4.34 27.7 4.04 22.3L1.78 23.8C0.66 24.56 0 25.8 0 27.14V39L7.38 36.04ZM32 39V27.14C32 25.8 31.34 24.56 30.22 23.82L27.96 22.32C27.66 27.7 25.56 33.6 24.62 36.06L32 39Z" />
      </svg>
      <div className={`glow shadow-primary`}></div>
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
  );
}
