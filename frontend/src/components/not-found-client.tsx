"use client";

import dynamic from "next/dynamic";

// The root not-found page ships with every route's client JS. Loading the scene as its own chunk
// keeps motion (~31 KB gzipped) off the pages that never render it.
export const NotFoundClient = dynamic(() =>
  import("./not-found-scene").then((mod) => mod.NotFoundScene),
);
