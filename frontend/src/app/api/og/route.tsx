import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import Logo from "@/components/logo";
import { getThemePalette } from "@/lib/services";

const MAX_TITLE_LENGTH = 80;

// Geist Sans Bold, read once per server process (Satori takes TTF, not WOFF2)
const geistBold = readFile(
  join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans/Geist-Bold.ttf"),
).catch((error: unknown) => {
  console.error("OG font could not be loaded:", error instanceof Error ? error.message : error);
  return null;
});

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

// Only the first letter: CSS `capitalize` would turn Turkish "ve", "ile" into "Ve", "İle"
const capitalizeFirst = (title: string) => title.charAt(0).toLocaleUpperCase("en") + title.slice(1);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const theme = url.searchParams.get("theme") === "light" ? "light" : "dark";
    const title = truncateTitle(url.searchParams.get("title"));

    const { schemes } = await getThemePalette();
    const themeColor = schemes[theme].primary;
    const bgColor = schemes[theme].surface;

    if (title) {
      const font = await geistBold;
      return new ImageResponse(
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
            fontFamily: font ? "Geist" : undefined,
            textAlign: "center",
            padding: "80px",
          }}
        >
          <Logo color={themeColor} width={256} height={256} viewBox="0 0 512 512" />
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              marginTop: 40,
              lineHeight: 1.2,
              maxWidth: "90%",
            }}
          >
            {capitalizeFirst(title)}
          </h1>
        </div>,
        {
          width: 1200,
          height: 630,
          headers,
          fonts: font ? [{ name: "Geist", data: font, weight: 700, style: "normal" }] : undefined,
        },
      );
    }

    return new ImageResponse(
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
      </div>,
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
