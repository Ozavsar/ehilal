import * as React from "react";
import { DEFAULT_THEME_COLORS } from "@/config/site";

// Site dark theme tokens (see globals.css); the primary color comes from the Strapi theme
const COLORS = {
  background: "#121212",
  card: "#242630",
  border: "#2b2a2a",
  foreground: "#ffffff",
  mutedForeground: "#bfbfbf",
};

interface EmailTemplateProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  primaryColor?: string;
}

// Picks dark or light text so the button stays readable whatever primary color is set in Strapi
function getOnPrimaryColor(hex: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return COLORS.foreground;
  // Linearised sRGB channel starting at hex[i]
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  return luminance > 0.179 ? COLORS.background : COLORS.foreground;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  email,
  subject,
  message,
  primaryColor = DEFAULT_THEME_COLORS.primaryDark,
}) => (
  <div
    style={{
      fontFamily: "'Segoe UI', 'Helvetica', 'Arial', sans-serif",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "30px",
      backgroundColor: COLORS.card,
      borderRadius: "8px",
    }}
  >
    <div
      style={{
        backgroundColor: COLORS.background,
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            color: COLORS.foreground,
            fontSize: "28px",
            margin: "0",
            fontWeight: "600",
            letterSpacing: "0.5px",
          }}
        >
          New Message Received
        </h1>
        <div
          style={{
            width: "50px",
            height: "4px",
            backgroundColor: primaryColor,
            margin: "15px auto",
            borderRadius: "2px",
          }}
        ></div>
      </div>

      <div
        style={{
          marginBottom: "25px",
          padding: "20px",
          backgroundColor: COLORS.card,
          borderRadius: "8px",
        }}
      >
        <p style={{ margin: "0 0 10px 0", color: COLORS.foreground, fontSize: "16px" }}>
          <strong style={{ color: COLORS.mutedForeground }}>From:</strong> {name}
        </p>
        <p style={{ margin: "0 0 10px 0", color: COLORS.foreground, fontSize: "16px" }}>
          <strong style={{ color: COLORS.mutedForeground }}>Email:</strong> {email}
        </p>
        <p style={{ margin: "0", color: COLORS.foreground, fontSize: "16px" }}>
          <strong style={{ color: COLORS.mutedForeground }}>Subject:</strong> {subject}
        </p>
      </div>

      <div
        style={{
          backgroundColor: COLORS.card,
          padding: "25px",
          borderRadius: "8px",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h2
          style={{
            color: COLORS.foreground,
            marginTop: "0",
            fontSize: "22px",
            fontWeight: "600",
          }}
        >
          Message Content:
        </h2>
        <p
          style={{
            color: COLORS.foreground,
            lineHeight: "1.6",
            fontSize: "16px",
            whiteSpace: "pre-wrap",
          }}
        >
          {message}
        </p>
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: primaryColor,
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <a
          href={`mailto:${email}`}
          style={{
            color: getOnPrimaryColor(primaryColor),
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "16px",
          }}
        >
          Reply to this message
        </a>
      </div>
    </div>
  </div>
);
