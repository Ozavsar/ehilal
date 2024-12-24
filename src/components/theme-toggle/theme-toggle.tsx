"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import "./theme-toggle.css";

export default function ThemeToggle() {
  const switchRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { setTheme, theme } = useTheme();

  const toggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!switchRef.current) return;
    if (theme === "dark") switchRef.current.classList.add("off");
    else switchRef.current.classList.remove("off");
  }, [theme, mounted]);

  if (!mounted) return null;

  return (
    <div
      id="switch"
      ref={switchRef}
      onClick={toggle}
      className="fixed right-0 top-1 scale-75 sm:right-4 sm:top-8"
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
