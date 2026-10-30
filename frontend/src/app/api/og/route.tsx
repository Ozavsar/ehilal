import { ImageResponse } from "next/og";
import Logo from "@/components/logo";
import { getThemeColors } from "@/lib/services";

export const runtime = "edge";

const MAX_TITLE_LENGTH = 80;

// Not `immutable`: the theme colour comes from Strapi and can change under the same URL
const headers = {
  "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
};

// Caps by code points so surrogate pairs (emoji) are never split
function truncateTitle(title: string | null) {
  if (!title) return title;
  const chars = Array.from(title);
  if (chars.length <= MAX_TITLE_LENGTH) return title;
  const truncated = chars.slice(0, MAX_TITLE_LENGTH - 1).join("");
  return `${truncated.trimEnd()}…`;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const theme = (url.searchParams.get("theme") as "light" | "dark") || "dark";
    const source = url.searchParams.get("source") || "og";
    const title = truncateTitle(url.searchParams.get("title"));

    // Falls back to the default colours when Strapi is unreachable
    const themeColors = await getThemeColors();
    const themeColor = theme === "dark" ? themeColors.primaryDark : themeColors.primaryLight;
    // --background in globals.css
    const bgColor = theme === "dark" ? "#121212" : "#f5f5f5";

    if (source === "favicon") {
      return new ImageResponse(<Logo fill={bgColor} color={themeColor} />, {
        width: 512,
        height: 512,
        headers,
      });
    }

    if (title) {
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
              backgroundColor: bgColor,
              color: themeColor,
              fontFamily: "Inter, sans-serif",
              textAlign: "center",
              padding: "80px",
            }}
          >
            <Logo color={themeColor} width={256} height={256} />
            <h1
              style={{
                fontSize: 64,
                fontWeight: 800,
                marginTop: 40,
                lineHeight: 1.2,
                maxWidth: "90%",
                textTransform: "capitalize",
              }}
            >
              {title}
            </h1>
          </div>
        ),
        {
          width: 1200,
          height: 630,
          headers,
        },
      );
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
      {
        width: 1200,
        height: 630,
        headers,
      },
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
