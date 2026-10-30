"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_THEME_COLORS, themeColorVariables } from "@/config/site";
import "./globals.css";

// Replaces the root layout when it fails, so nothing here may depend on Strapi (theme, header, providers)
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="dark" style={themeColorVariables(DEFAULT_THEME_COLORS)}>
      <body className="min-h-screen antialiased">
        <title>Something went wrong</title>
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-center md:py-4">
          <p
            aria-hidden="true"
            className="text-card tracking-backdrop text-6xl font-extrabold uppercase select-none sm:text-9xl"
          >
            Oops
          </p>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
            Houston, we have a <span className="text-primary">problem</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md max-md:text-sm sm:mt-4">
            The site couldn&apos;t be loaded right now. Please try again in a moment.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:mt-8">
            {/* A full reload, since the root layout itself failed */}
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-primary/75 text-primary hover:bg-primary/20 bg-transparent hover:text-white"
            >
              Try again
            </Button>
            <Button asChild variant="link">
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full reload on purpose */}
              <a href="/">Return to Mission Control</a>
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
