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
        url: "https://ehilal.net/api/og?theme=light&source=favicon",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "icon",
        type: "image/png",
        url: "https://ehilal.net/api/og?theme=dark&source=favicon",
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
        url: "https://ehilal.net/api/og",
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
        url: "https://ehilal.net/api/og",
        width: 1200,
        height: 630,
        alt: "Elif Hilal Logo",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { primaryDark, primaryLight } = await getTheme();
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
        className={`${GeistSans.variable} ${GeistMono.variable} relative grid min-h-screen grid-rows-[auto_1fr_auto] transition-all selection:bg-muted selection:text-primary`}
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
