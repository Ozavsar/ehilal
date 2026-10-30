"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isRetrying, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  // Refetch the server components, then clear the error state to render them again
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-center md:py-4">
      <p
        aria-hidden="true"
        className="text-muted-foreground/25 dark:text-card tracking-backdrop text-6xl font-extrabold uppercase select-none sm:text-9xl"
      >
        Oops
      </p>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        Houston, we have a <span className="text-primary">problem</span>
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md max-md:text-sm sm:mt-4">
        This page couldn&apos;t be loaded right now. Please try again in a moment.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:mt-8">
        <Button
          variant="outline"
          onClick={retry}
          disabled={isRetrying}
          className="border-primary/75 text-primary hover:bg-primary/20 bg-transparent hover:text-white"
        >
          {isRetrying ? "Retrying…" : "Try again"}
        </Button>
        <Button asChild variant="link">
          <Link href={INTERNAL_ROUTES.HOME.path}>Return to Mission Control</Link>
        </Button>
      </div>
    </main>
  );
}
