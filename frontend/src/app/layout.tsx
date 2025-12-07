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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ehilal.net";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Elif Hilal Kara";
const TWITTER_HANDLE =
  process.env.NEXT_PUBLIC_TWITTER_HANDLE || "@elifhilalumucu";
const TWITTER_USER_ID =
  process.env.NEXT_PUBLIC_TWITTER_USER_ID || "1035512458935521280";

// updated

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} | Legal Engineer`,
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

  description:
    "Personal portfolio of Elif Hilal Kara — legal engineer, conference speaker, and lifelong learner.",
  robots: SITE_URL.includes("dev.") ? "noindex, nofollow" : "index, follow",
  openGraph: {
    title: `${SITE_NAME} | Legal Engineer`,
    description:
      "Personal portfolio of Elif Hilal Kara — legal engineer, conference speaker, and lifelong learner.",
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    alternateLocale: ["tr_TR"],
    images: [
      {
        url: `${SITE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Open Graph Image`,
      },
    ],
  },

  twitter: {
    title: `${SITE_NAME} | Legal Engineer`,
    description:
      "Personal portfolio of Elif Hilal Kara — legal engineer, conference speaker, and lifelong learner.",
    card: "summary_large_image",
    creator: `${TWITTER_HANDLE}`,
    creatorId: `${TWITTER_USER_ID}`,
    site: `${TWITTER_HANDLE}`,
    siteId: `${TWITTER_USER_ID}`,
    images: [
      {
        url: `${SITE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Twitter Card Image`,
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
      suppressHydrationWarning
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
