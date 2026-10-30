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
    <main
      id="main"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 text-center sm:px-6 md:py-4"
    >
      <p
        aria-hidden="true"
        className="text-outline-variant type-display-large uppercase select-none"
      >
        Oops
      </p>
      <h1 className="type-headline-small sm:type-headline-medium mt-6">
        Houston, we have a <span className="text-primary">problem</span>
      </h1>
      <p className="text-on-surface-variant type-body-medium sm:type-body-large mt-2 max-w-md sm:mt-4">
        This page couldn&apos;t be loaded right now. Please try again in a moment.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:mt-8">
        <Button variant="outline" onClick={retry} disabled={isRetrying}>
          {isRetrying ? "Retrying…" : "Try again"}
        </Button>
        <Button asChild variant="link">
          <Link href={INTERNAL_ROUTES.HOME.path}>Return to Mission Control</Link>
        </Button>
      </div>
    </main>
  );
}
