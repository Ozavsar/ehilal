import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Providers from "@/context/providers";
import type { Metadata } from "next";
import Header from "@/components/header";
import "swiper/css";
import "swiper/css/navigation";
import "./globals.css";
import RocketCursor from "@/components/rocket-cursor";

export const metadata: Metadata = {
  title: "Elif Hilal - Portfolio",
  icons: {
    icon: [
      {
        rel: "icon",
        type: "image/png",
        url: "/images/logo/eh-logo-light.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "icon",
        type: "image/png",
        url: "/images/logo/eh-logo-dark.png",
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
        url: "/images/og-img.png",
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
        url: "/images/og-img.png",
        width: 1200,
        height: 630,
        alt: "Elif Hilal Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} relative grid min-h-screen grid-rows-[auto_1fr_auto] transition-all selection:bg-muted selection:text-primary max-sm:py-20`}
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          {children}
        </Providers>

        <RocketCursor />
      </body>
    </html>
  );
}
