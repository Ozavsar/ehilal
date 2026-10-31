import { ImageResponse } from "next/og";
import Logo from "@/components/logo";
import { getThemePalette } from "@/lib/services";

// Browser tab (32), Google results (48, a multiple of 48 px) and the web manifest (192, 512)
const SIZES = [32, 48, 192, 512] as const;

// The palette request is tagged `theme`, so the Strapi theme webhook refreshes the icons too
export const revalidate = 86400;

export function generateImageMetadata() {
  return SIZES.map((size) => ({
    id: String(size),
    size: { width: size, height: size },
    contentType: "image/png",
  }));
}

// One scheme for every tab (file-based icons can't carry a media query): the dark one, like /api/og
export default async function Icon({ id }: { id: Promise<string> }) {
  // Next answers 404 for ids generateImageMetadata didn't return, so this is one of SIZES
  const size = Number(await id);
  const { primary, surface } = (await getThemePalette()).schemes.dark;

  return new ImageResponse(
    <Logo width={size} height={size} viewBox="0 0 512 512" fill={surface} color={primary} />,
    { width: size, height: size },
  );
}
