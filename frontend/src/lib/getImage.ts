import "server-only";
import { getPlaiceholder } from "plaiceholder";
import { getStrapiURL } from "./api/fetchAPI";

export const getImage = async (src: string) => {
  const url = src.startsWith("/") ? getStrapiURL(src) : src;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());

  const {
    metadata: { height, width },
    ...plaiceholder
  } = await getPlaiceholder(buffer, { size: 10 });

  return {
    ...plaiceholder,
    img: { src, height, width },
  };
};
