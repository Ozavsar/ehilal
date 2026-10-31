"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_PALETTE, paletteToCss } from "@/lib/palette-css";
import "./globals.css";

// Replaces the failed root layout: nothing here may depend on Strapi (theme, header, providers)
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <head>
        <style dangerouslySetInnerHTML={{ __html: paletteToCss(DEFAULT_PALETTE) }} />
      </head>
      <body className="type-body-large min-h-screen antialiased">
        <title>Something went wrong</title>
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-center sm:px-6 md:py-4">
          <p
            aria-hidden="true"
            className="text-surface-container-highest type-display-large uppercase select-none"
          >
            Oops
          </p>
          <h1 className="type-headline-small sm:type-headline-medium mt-6">
            Houston, we have a <span className="text-primary">problem</span>
          </h1>
          <p className="text-on-surface-variant type-body-medium sm:type-body-large mt-2 max-w-md sm:mt-4">
            The site couldn&apos;t be loaded right now. Please try again in a moment.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:mt-8">
            {/* A full reload, since the root layout itself failed */}
            <Button variant="outline" onClick={() => window.location.reload()}>
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
