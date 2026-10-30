import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type Brand = "x" | "instagram" | "linkedin" | "youtube" | "medium" | "substack" | "udemy";

type BrandIconProps = {
  brand: Brand;
  /** Same sizes as <Icon>. Left unset, it follows an inherited `--icon-size` (24 by default). */
  size?: 20 | 24 | 40;
  className?: string;
};

// Paths copied from react-icons 5.7.0 (FaXTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaMedium, BsSubstack,
// SiUdemy) instead of importing the package, which dev builds ship whole to client bundles.
// Sources: Font Awesome Free 6 by Fonticons, Inc. (https://fontawesome.com, CC BY 4.0,
// https://fontawesome.com/license/free), Bootstrap Icons (https://icons.getbootstrap.com, MIT) and Simple Icons
// (https://simpleicons.org, CC0 1.0).
// Each view box is a square around the mark with a 10% margin, so it fills 20 of 24 px like a Material Symbol.
const BRANDS: Record<Brand, { viewBox: string; path: string }> = {
  x: {
    // Font Awesome 6 x-twitter
    viewBox: "-19.22 -20.12 552.24 552.24",
    path: "M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z",
  },
  instagram: {
    // Font Awesome 6 instagram
    viewBox: "-44.9 -13.05 537.9 537.9",
    path: "M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z",
  },
  linkedin: {
    // Font Awesome 6 linkedin-in
    viewBox: "-44.8 -44.8 537.6 537.6",
    path: "M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z",
  },
  youtube: {
    // Font Awesome 6 youtube
    viewBox: "-39.68 -71.68 655.36 655.36",
    path: "M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z",
  },
  medium: {
    // Font Awesome 6 medium
    viewBox: "-64 -128 768 768",
    path: "M180.5,74.262C80.813,74.262,0,155.633,0,256S80.819,437.738,180.5,437.738,361,356.373,361,256,280.191,74.262,180.5,74.262Zm288.25,10.646c-49.845,0-90.245,76.619-90.245,171.095s40.406,171.1,90.251,171.1,90.251-76.619,90.251-171.1H559C559,161.5,518.6,84.908,468.752,84.908Zm139.506,17.821c-17.526,0-31.735,68.628-31.735,153.274s14.2,153.274,31.735,153.274S640,340.631,640,256C640,171.351,625.785,102.729,608.258,102.729Z",
  },
  substack: {
    // Bootstrap Icons substack
    viewBox: "-1.6 -1.6 19.2 19.2",
    path: "M15 3.604H1v1.891h14v-1.89ZM1 7.208V16l7-3.926L15 16V7.208zM15 0H1v1.89h14z",
  },
  udemy: {
    // Simple Icons udemy
    viewBox: "-2.4 -2.4 28.8 28.8",
    path: "M12 0L5.81 3.573v3.574l6.189-3.574 6.191 3.574V3.573zM5.81 10.148v8.144c0 1.85.589 3.243 1.741 4.234S10.177 24 11.973 24s3.269-.482 4.448-1.474c1.179-.991 1.768-2.439 1.768-4.314v-8.064h-3.242v7.85c0 2.036-1.509 3.055-2.948 3.055-1.428 0-2.947-.991-2.947-3.027v-7.878z",
  },
};

/**
 * A monochrome brand mark (inline SVG in `currentColor`), sized and aligned like <Icon>.
 * Always decorative: the control around it carries the accessible name.
 */
export function BrandIcon({ brand, size, className }: BrandIconProps) {
  const { viewBox, path } = BRANDS[brand];
  const style = size ? ({ "--icon-size": `${size}px` } as CSSProperties) : undefined;

  return (
    <svg
      data-slot="icon"
      aria-hidden="true"
      focusable="false"
      viewBox={viewBox}
      fill="currentColor"
      className={cn("inline-block size-(--icon-size,24px) shrink-0", className)}
      style={style}
    >
      <path d={path} />
    </svg>
  );
}
