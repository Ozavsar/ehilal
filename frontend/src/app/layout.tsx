import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import Header from "@/components/header";
import HistoryMorph from "@/components/history-morph";
import "./globals.css";
import { unstable_rethrow } from "next/navigation";
import JsonLd from "@/components/json-ld";
import Providers from "@/context/providers";
import { getSiteSettings, getSocialMediaLinks, getThemePalette } from "@/lib/services";
import { SITE_URL } from "@/config/site";
import {
  IS_PRODUCTION_SITE,
  MEDIUM_PROFILE_URL,
  SUBSTACK_PROFILE_URL,
  YOUTUBE_CHANNEL_URL,
} from "@/config/seo";
import { siteJsonLd } from "@/lib/metadata";
import { paletteToCss } from "@/lib/palette";
import type { ISiteSettings } from "@/types";

// `geist/font/mono` with preload off: only article code blocks use it, so the browser fetches the
// file on pages that render one instead of every page preloading it.
const geistMono = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  adjustFontFallback: false,
  preload: false,
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Roboto Mono",
    "Menlo",
    "Monaco",
    "Liberation Mono",
    "DejaVu Sans Mono",
    "Courier New",
    "monospace",
  ],
});

// Material Symbols Rounded, the subset of the glyphs in components/icon-names.ts (`yarn icons:subset`).
// Preloaded: the navigation shows icons above the fold. `display: block` and no fallback face, so a
// slow font paints nothing rather than the ligature names; a failed one is handled below.
const materialSymbols = localFont({
  src: "./fonts/material-symbols-rounded.woff2",
  variable: "--font-icon",
  weight: "400",
  display: "block",
  preload: true,
  adjustFontFallback: false,
  fallback: [],
});

// When the icon font fails to load (blocked, 404), hide the glyph boxes instead of showing their
// ligature names. Runs after `load`, when the @font-face rule is parsed and its load has settled.
const iconFontGuard = `(()=>{const f=${JSON.stringify(`24px ${materialSymbols.style.fontFamily}`)};const off=()=>document.documentElement.classList.add("icons-unavailable");const run=()=>document.fonts.load(f,"home").then(r=>{if(!r.length)off()},off);document.readyState==="complete"?run():addEventListener("load",run,{once:true})})()`;

export async function generateMetadata(): Promise<Metadata> {
  // Falls back to the defaults in config/site.ts, so a Strapi outage can't fail every page from here
  const site = await getSiteSettings();
  const defaultTitle = `${site.siteName} | ${site.jobTitle}`;
  const { defaultOgImage } = site;

  return {
    // Resolves relative URLs of file-based metadata (app/icon.tsx, app/apple-icon.tsx)
    metadataBase: new URL(SITE_URL),
    title: {
      template: `%s | ${site.siteName}`,
      default: defaultTitle,
    },

    description: site.siteDescription,
    // Indexable by default; dev.*, previews and local builds also get the X-Robots-Tag header
    ...(!IS_PRODUCTION_SITE && { robots: { index: false, follow: false } }),
    openGraph: {
      title: defaultTitle,
      description: site.siteDescription,
      type: "website",
      url: SITE_URL,
      siteName: site.siteName,
      locale: "en_US",
      images: [
        {
          ...defaultOgImage,
          alt: defaultOgImage.alt || `${site.siteName} Open Graph Image`,
        },
      ],
    },

    twitter: {
      title: defaultTitle,
      description: site.siteDescription,
      card: "summary_large_image",
      creator: site.twitterHandle,
      creatorId: site.twitterUserId,
      site: site.twitterHandle,
      siteId: site.twitterUserId,
      images: [
        {
          ...defaultOgImage,
          alt: defaultOgImage.alt || `${site.siteName} Twitter Card Image`,
        },
      ],
    },
  };
}

// Mobile browser bar colour, per OS colour scheme (the meta tag can't follow the next-themes class)
export async function generateViewport(): Promise<Viewport> {
  const { schemes } = await getThemePalette();
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: schemes.light.surface },
      { media: "(prefers-color-scheme: dark)", color: schemes.dark.surface },
    ],
  };
}

const isHttpUrl = (url: string | null | undefined): url is string =>
  !!url && /^https?:\/\/\S+$/i.test(url.trim());

// The site owner's profiles elsewhere, for the Person's `sameAs` (Knowledge Panel matching). The
// Strapi social links when set, the known profiles otherwise; never fails the layout.
async function getProfileUrls(site: ISiteSettings): Promise<string[]> {
  const links = await getSocialMediaLinks().catch((error: unknown) => {
    unstable_rethrow(error);
    console.error(
      "Social media links could not be loaded for the structured data:",
      error instanceof Error ? error.message : error,
    );
    return null;
  });
  return [
    links?.linkedin,
    links?.twitter_x || `https://x.com/${site.twitterHandle.replace(/^@/, "")}`,
    links?.youtube || YOUTUBE_CHANNEL_URL,
    links?.instagram,
    links?.medium || MEDIUM_PROFILE_URL,
    links?.substack || SUBSTACK_PROFILE_URL,
    links?.udemy,
  ]
    .filter(isHttpUrl)
    .map((url) => url.trim());
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Falls back to the default palette, so a Strapi outage can't take the whole site down from here
  const [palette, site] = await Promise.all([getThemePalette(), getSiteSettings()]);
  const profileUrls = await getProfileUrls(site);
  return (
    <html
      lang="en"
      // The Geist variables sit on <html> because the base font-family (Tailwind preflight) is set there
      className={`${GeistSans.variable} ${geistMono.variable} ${materialSymbols.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        {/* The --m3-* colour roles globals.css maps to Tailwind colours. Safe to inline: every
            value passed the palette schema's hex check. */}
        <style id="m3-palette" dangerouslySetInnerHTML={{ __html: paletteToCss(palette) }} />
        <script id="icon-font-guard" dangerouslySetInnerHTML={{ __html: iconFontGuard }} />
        {/* Person + WebSite on every page; pages add their own nodes that point to them by @id */}
        <JsonLd data={siteJsonLd(site, profileUrls)} />
      </head>
      {/* The page clears the fixed navigation: the rail on the left from sm, the bar at the bottom below */}
      <body
        className="type-body-large max-sm:pb-nav-bar sm:pl-rail relative flex min-h-screen flex-col antialiased"
        suppressHydrationWarning
      >
        <Providers>
          {/* Back/Forward between the blog list and an article morph like a link click */}
          <HistoryMorph />
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
