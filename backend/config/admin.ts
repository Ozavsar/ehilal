// Origin of the website (e.g. https://ehilal.net), used for the theme preview
const frontendOrigin = (url: string | undefined): string | null => {
  try {
    return url ? new URL(url).origin : null;
  } catch {
    return null;
  }
};

export default ({ env }) => {
  const frontendUrl = frontendOrigin(env("FRONTEND_URL"));
  const previewSecret = env("PREVIEW_SECRET");

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    // "Open preview" on the Theme: the website in draft mode, showing the draft palette.
    // Off without FRONTEND_URL and PREVIEW_SECRET.
    preview: {
      enabled: Boolean(frontendUrl && previewSecret),
      config: {
        allowedOrigins: frontendUrl ? [frontendUrl] : [],
        async handler(uid: string, { status }: { documentId?: string; locale?: string; status?: string }) {
          if (uid !== "api::theme.theme" || !frontendUrl || !previewSecret) return null;
          const query = new URLSearchParams({
            secret: previewSecret,
            status: status === "published" ? "published" : "draft",
            url: "/theme-preview",
          });
          return `${frontendUrl}/api/preview?${query}`;
        },
      },
    },
  };
};
