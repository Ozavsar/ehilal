import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import RocketCursor from "@/components/rocket-cursor";
import Header from "@/components/header";
import "swiper/css/navigation";
import "./globals.css";
import "swiper/css";
import Providers from "@/context/providers";
import { getThemeColors } from "@/lib/services";
import {
  SITE_NAME,
  SITE_URL,
  TWITTER_HANDLE,
  TWITTER_USER_ID,
  themeColorVariables,
} from "@/config/site";

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
  // Falls back to default colours, so a Strapi outage can't take the whole site down from here
  const themeColors = await getThemeColors();
  return (
    <html
      lang="en"
      className="dark"
      style={themeColorVariables(themeColors)}
      suppressHydrationWarning
    >
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} selection:bg-primary relative grid min-h-screen grid-rows-[auto_1fr_auto] antialiased transition-colors duration-300 selection:text-white`}
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
