"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import "./theme-toggle.css";

export default function ThemeToggle() {
  const switchRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  const toggle = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!switchRef.current) return;
    if (resolvedTheme === "dark") switchRef.current.classList.add("off");
    else switchRef.current.classList.remove("off");
  }, [resolvedTheme, mounted]);

  if (!mounted) return null;

  return (
    <div
      id="switch"
      ref={switchRef}
      onClick={toggle}
      className="fixed -right-6 top-1 scale-50 cursor-pointer sm:right-4 sm:top-8 sm:scale-75"
    >
      <div id="contentwrapper">
        <div id="circle"></div>

        <div id="stars">
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div id="shtngstarwrapper">
            <div id="shootingstar"></div>
          </div>
        </div>

        <div>
          <div className="cloud">
            <div className="cloudpart"></div>
            <div className="cloudpart"></div>
          </div>
          <div className="cloud">
            <div className="cloudpart"></div>
            <div className="cloudpart"></div>
          </div>
          <div className="cloud">
            <div className="cloudpart"></div>
            <div className="cloudpart"></div>
            <div className="cloudpart"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
