import Logo from "@/components/logo";
import { getTheme } from "@/lib/services";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const theme =
    (new URL(request.url).searchParams.get("theme") as "light" | "dark") ||
    "dark";
  const source = new URL(request.url).searchParams.get("source") || "og";

  const themeResponse = await getTheme();
  const themeColor =
    theme === "dark" ? themeResponse.primaryDark : themeResponse.primaryLight;

  const bgColor = theme === "dark" ? "hsl(0, 0%, 7%)" : "hsl(0, 0%, 96%)";

  if (source === "favicon") {
    return new ImageResponse(<Logo fill={bgColor} color={themeColor} />, {
      width: 512,
      height: 512,
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          backgroundColor: bgColor,
        }}
      >
        <Logo color={themeColor} />
      </div>
    ),
  );
}
