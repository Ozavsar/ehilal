import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import hextohsl from "hex-to-hsl";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import RocketCursor from "@/components/rocket-cursor";
import Header from "@/components/header";
import "swiper/css/navigation";
import "./globals.css";
import "swiper/css";
import Providers from "@/context/providers";
import { getTheme } from "@/lib/services";

export const metadata: Metadata = {
  title: {
    template: "%s | Elif Hilal Umucu",
    default: "Portfolio | Elif Hilal",
  },
  icons: {
    icon: [
      {
        rel: "icon",
        type: "image/png",
        url: "https://7cf5-2a09-bac5-58c3-d2d-00-150-b1.ngrok-free.app/api/og?theme=light&source=favicon",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "icon",
        type: "image/png",
        url: "https://7cf5-2a09-bac5-58c3-d2d-00-150-b1.ngrok-free.app/api/og?theme=dark&source=favicon",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },

  description:
    "Welcome to my portfolio! You can learn about my conferences, talks and blog here.",
  robots: "index, follow",
  openGraph: {
    title: "Elif Hilal - Portfolio",
    description:
      "Welcome to my portfolio! You can learn about my conferences, talks and blog here.",
    type: "website",
    url: "https://ehilal.net",
    siteName: "ehilal.net",
    locale: "en_US",
    images: [
      {
        url: "https://7cf5-2a09-bac5-58c3-d2d-00-150-b1.ngrok-free.app/api/og",
        width: 1200,
        height: 630,
        alt: "Elif Hilal Logo",
      },
    ],
  },
  twitter: {
    title: "Elif Hilal - Portfolio",
    description:
      "Welcome to my portfolio! You can learn about my conferences, talks and blog here.",
    card: "summary_large_image",
    creator: "@elifhilalumucu",
    creatorId: "elifhilalumucu",
    site: "@elifhilalumucu",
    siteId: "@elifhilalumucu",
    images: [
      {
        url: "https://7cf5-2a09-bac5-58c3-d2d-00-150-b1.ngrok-free.app/api/og",
        width: 1200,
        height: 630,
        alt: "Elif Hilal Logo",
      },
    ],
  },
};

const getCachedTheme = unstable_cache(getTheme, ["get-website-theme"], {
  tags: ["theme"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { primaryDark, primaryLight } = await getCachedTheme();
  const hslDark = hextohsl(primaryDark);
  const hslLight = hextohsl(primaryLight);
  return (
    <html
      lang="en"
      className="dark"
      style={
        {
          "--primary-dark": `${hslDark[0]}, ${hslDark[1]}%, ${hslDark[2]}%`,
          "--primary-light": `${hslLight[0]}, ${hslLight[1]}%, ${hslLight[2]}%`,
        } as React.CSSProperties
      }
    >
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} relative grid min-h-screen grid-rows-[auto_1fr_auto] transition-all selection:bg-muted selection:text-primary max-sm:py-20`}
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          {children}
          <RocketCursor />
        </Providers>
      </body>
    </html>
  );
}
