import { ImageResponse } from "next/og";
import Logo from "@/components/logo";
import { getTheme } from "@/lib/services";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const theme = (url.searchParams.get("theme") as "light" | "dark") || "dark";
    const source = url.searchParams.get("source") || "og";
    const title = url.searchParams.get("title");

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
      },
    );
  } catch (error: any) {
    console.error("❌ Error generating image:", error);
    return new Response("Failed to generate image", { status: 500 });
  }
}
