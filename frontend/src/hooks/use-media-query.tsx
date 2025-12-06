"use client";

import { useState, useEffect } from "react";

type UseMediaQueryOptions = {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
};

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {},
): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return defaultValue;
    if (!initializeWithValue) return defaultValue;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // İlk eşleşme durumu (client mount sonrası)
    setMatches(mediaQueryList.matches);

    // Modern API
    mediaQueryList.addEventListener("change", handleChange);

    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}
