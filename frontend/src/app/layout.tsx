import type { Metadata } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import Header from "@/components/header";
import "./globals.css";
import Providers from "@/context/providers";
import { getSiteSettings, getThemeColors } from "@/lib/services";
import { SITE_URL, themeColorVariables } from "@/config/site";

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

export async function generateMetadata(): Promise<Metadata> {
  // Falls back to the defaults in config/site.ts, so a Strapi outage can't fail every page from here
  const site = await getSiteSettings();
  const defaultTitle = `${site.siteName} | ${site.jobTitle}`;
  const { defaultOgImage } = site;

  return {
    title: {
      template: `%s | ${site.siteName}`,
      default: defaultTitle,
    },

    icons: {
      icon: [
        {
          rel: "icon",
          type: "image/png",
          url: `${SITE_URL}/api/og?theme=light&source=favicon`,
          media: "(prefers-color-scheme: light)",
        },
        {
          rel: "icon",
          type: "image/png",
          url: `${SITE_URL}/api/og?theme=dark&source=favicon`,
          media: "(prefers-color-scheme: dark)",
        },
      ],
    },

    description: site.siteDescription,
    robots: SITE_URL.includes("dev.") ? "noindex, nofollow" : "index, follow",
    openGraph: {
      title: defaultTitle,
      description: site.siteDescription,
      type: "website",
      url: SITE_URL,
      siteName: site.siteName,
      locale: "en_US",
      alternateLocale: ["tr_TR"],
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Falls back to default colours, so a Strapi outage can't take the whole site down from here
  const themeColors = await getThemeColors();
  return (
    <html
      lang="en"
      // The Geist variables sit on <html> because the base font-family (Tailwind preflight) is set there
      className={`${GeistSans.variable} ${geistMono.variable} dark`}
      style={themeColorVariables(themeColors)}
      suppressHydrationWarning
    >
      <body
        className="selection:bg-primary relative grid min-h-screen grid-rows-[auto_1fr_auto] antialiased selection:text-white"
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
