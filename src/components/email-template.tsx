import * as React from "react";

interface EmailTemplateProps {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  name,
  email,
  subject,
  message,
}) => (
  <div
    style={{
      fontFamily: "'Segoe UI', 'Helvetica', 'Arial', sans-serif",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "30px",
      backgroundColor: "#2c2b2b",
      borderRadius: "8px",
    }}
  >
    <div
      style={{
        backgroundColor: "#121212",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        animation: "fadeIn 0.5s ease-out",
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
            color: "#fff",
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
            backgroundColor: "#FEB204",
            margin: "15px auto",
            borderRadius: "2px",
          }}
        ></div>
      </div>

      <div
        style={{
          marginBottom: "25px",
          padding: "20px",
          backgroundColor: "#2c2b2b",
          borderRadius: "8px",
          transition: "background-color 0.3s ease",
        }}
      >
        <p style={{ margin: "0 0 10px 0", color: "#fff", fontSize: "16px" }}>
          <strong style={{ color: "#fff" }}>From:</strong> {name}
        </p>
        <p style={{ margin: "0 0 10px 0", color: "#fff", fontSize: "16px" }}>
          <strong style={{ color: "#fff" }}>Email:</strong> {email}
        </p>
        <p style={{ margin: "0", color: "#fff", fontSize: "16px" }}>
          <strong style={{ color: "#fff" }}>Subject:</strong> {subject}
        </p>
      </div>

      <div
        style={{
          backgroundColor: "#2c2b2b",
          padding: "25px",
          borderRadius: "8px",
          border: "1px solid #121212",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <h2
          style={{
            color: "#FEB204",
            marginTop: "0",
            fontSize: "22px",
            fontWeight: "600",
          }}
        >
          Message Content:
        </h2>
        <p style={{ color: "#fff", lineHeight: "1.6", fontSize: "16px" }}>
          {message}
        </p>
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#FEB204",
          borderRadius: "8px",
          textAlign: "center",
          transition: "background-color 0.3s ease",
        }}
      >
        <a
          href={`mailto:${email}`}
          style={{
            color: "#2c2b2b",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "16px",
          }}
        >
          Reply to this message
        </a>
      </div>
    </div>
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @media (prefers-color-scheme: dark) {
        body { background-color: #2c3e50; color: #ecf0f1; }
      }
    `}</style>
  </div>
);
