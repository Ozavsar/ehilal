import { ImageResponse } from "next/og";
import Logo from "@/components/logo";
import { getThemePalette } from "@/lib/services";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export const revalidate = 86400;

// Opaque square: iOS masks the corners itself and fills transparent pixels with black
const LOGO_SIZE = 140;

export default async function AppleIcon() {
  const { primary, surface } = (await getThemePalette()).schemes.dark;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: surface,
      }}
    >
      <Logo
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        viewBox="0 0 512 512"
        fill={surface}
        color={primary}
      />
    </div>,
    size,
  );
}
