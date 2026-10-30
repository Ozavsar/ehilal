import * as React from "react";
import { DEFAULT_PALETTE, type Scheme } from "@/lib/palette-css";

interface EmailTemplateProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  // The light scheme of the site palette: mail clients handle dark mode too unevenly to target it
  colors?: Scheme;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  email,
  subject,
  message,
  colors = DEFAULT_PALETTE.schemes.light,
}) => (
  <div
    style={{
      fontFamily: "'Segoe UI', 'Helvetica', 'Arial', sans-serif",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "30px",
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: "8px",
    }}
  >
    <div
      style={{
        backgroundColor: colors.surface,
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
            color: colors.onSurface,
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
            backgroundColor: colors.primary,
            margin: "15px auto",
            borderRadius: "2px",
          }}
        ></div>
      </div>

      <div
        style={{
          marginBottom: "25px",
          padding: "20px",
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: "8px",
        }}
      >
        <p style={{ margin: "0 0 10px 0", color: colors.onSurface, fontSize: "16px" }}>
          <strong style={{ color: colors.onSurfaceVariant }}>From:</strong> {name}
        </p>
        <p style={{ margin: "0 0 10px 0", color: colors.onSurface, fontSize: "16px" }}>
          <strong style={{ color: colors.onSurfaceVariant }}>Email:</strong> {email}
        </p>
        <p style={{ margin: "0", color: colors.onSurface, fontSize: "16px" }}>
          <strong style={{ color: colors.onSurfaceVariant }}>Subject:</strong> {subject}
        </p>
      </div>

      <div
        style={{
          backgroundColor: colors.surfaceContainerLow,
          padding: "25px",
          borderRadius: "8px",
          border: `1px solid ${colors.outlineVariant}`,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h2
          style={{
            color: colors.onSurface,
            marginTop: "0",
            fontSize: "22px",
            fontWeight: "600",
          }}
        >
          Message Content:
        </h2>
        <p
          style={{
            color: colors.onSurface,
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
          backgroundColor: colors.primary,
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <a
          href={`mailto:${email}`}
          style={{
            color: colors.onPrimary,
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
