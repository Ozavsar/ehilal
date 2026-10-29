"use client";

import { useCallback } from "react";
import { cn } from "@/lib/utils";
import "./theme-toggle.css";

type AnimationVariant = "circle" | "circle-blur" | "gif" | "polygon";

type StartPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export interface ThemeToggleButtonProps {
  theme?: "light" | "dark";
  variant?: AnimationVariant;
  start?: StartPosition;
  url?: string;
  onClick?: () => void;
}

export const ThemeToggleButton = ({
  theme = "light",
  variant = "circle",
  start = "center",
  url,
  onClick,
}: ThemeToggleButtonProps) => {
  const isDark = theme === "dark";

  const handleClick = useCallback(() => {
    // Inject animation styles for this specific transition
    const styleId = `theme-transition-${Date.now()}`;
    const style = document.createElement("style");
    style.id = styleId;

    // Generate animation CSS based on variant
    let css = "";
    const positions = {
      center: "center",
      "top-left": "top left",
      "top-right": "top right",
      "bottom-left": "bottom left",
      "bottom-right": "bottom right",
    };

    if (variant === "circle") {
      const cx = start === "center" ? "50" : start.includes("left") ? "0" : "100";
      const cy = start === "center" ? "50" : start.includes("top") ? "0" : "100";
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) { 
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-expand 0.4s ease-out;
            transform-origin: ${positions[start]};
          }
          @keyframes circle-expand {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
            }
          }
        }
      `;
    } else if (variant === "circle-blur") {
      const cx = start === "center" ? "50" : start.includes("left") ? "0" : "100";
      const cy = start === "center" ? "50" : start.includes("top") ? "0" : "100";
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) { 
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-blur-expand 0.5s ease-out;
            transform-origin: ${positions[start]};
            filter: blur(0);
          }
          @keyframes circle-blur-expand {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
              filter: blur(4px);
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
              filter: blur(0);
            }
          }
        }
      `;
    } else if (variant === "gif" && url) {
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: fade-out 0.4s ease-out;
          }
          ::view-transition-new(root) {
            animation: gif-reveal 2.5s cubic-bezier(0.4, 0, 0.2, 1);
            mask-image: url('${url}');
            mask-size: 0%;
            mask-repeat: no-repeat;
            mask-position: center;
          }
          @keyframes fade-out {
            to {
              opacity: 0;
            }
          }
          @keyframes gif-reveal {
            0% {
              mask-size: 0%;
            }
            20% {
              mask-size: 35%;
            }
            60% {
              mask-size: 35%;
            }
            100% {
              mask-size: 300%;
            }
          }
        }
      `;
    } else if (variant === "polygon") {
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: ${theme === "light" ? "wipe-in-dark" : "wipe-in-light"} 0.4s ease-out;
          }
          @keyframes wipe-in-dark {
            from {
              clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
            }
            to {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }
          @keyframes wipe-in-light {
            from {
              clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
            }
            to {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }
        }
      `;
    }

    if (css) {
      style.textContent = css;
      document.head.appendChild(style);

      // Clean up animation styles after transition
      setTimeout(() => {
        const styleEl = document.getElementById(styleId);
        if (styleEl) {
          styleEl.remove();
        }
      }, 3000);
    }

    // Call the onClick handler if provided
    onClick?.();
  }, [onClick, variant, start, url, theme]);

  // Decorative parts are spans (valid inside <button>). text-start undoes the button's centered
  // text-align and the block wrappers keep the old div layout (some parts use static position).
  return (
    <button
      type="button"
      id="switch"
      onClick={handleClick}
      aria-label="Dark mode"
      aria-pressed={isDark}
      className={cn(
        "focus-visible:outline-primary fixed top-1 -right-6 scale-50 cursor-pointer text-start focus-visible:outline-2 focus-visible:outline-offset-4 sm:top-8 sm:right-4 sm:scale-75",
        isDark && "off",
      )}
    >
      <span id="contentwrapper" aria-hidden="true">
        <span id="circle"></span>

        <span id="stars" className="block">
          <span className="star"></span>
          <span className="star"></span>
          <span className="star"></span>
          <span id="shtngstarwrapper" className="block">
            <span id="shootingstar"></span>
          </span>
        </span>

        <span className="block">
          <span className="cloud">
            <span className="cloudpart"></span>
            <span className="cloudpart"></span>
          </span>
          <span className="cloud">
            <span className="cloudpart"></span>
            <span className="cloudpart"></span>
          </span>
          <span className="cloud">
            <span className="cloudpart"></span>
            <span className="cloudpart"></span>
            <span className="cloudpart"></span>
          </span>
        </span>
      </span>
    </button>
  );
};
