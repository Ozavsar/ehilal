import { z } from "zod";

// Server-only environment. Never import this from a Client Component: the secrets aren't in the
// browser bundle, so validation would throw there.

// The deploy workflow writes unset secrets as empty lines (e.g. `CONTACT_TO_EMAIL=`), so blank means unset
const read = (value: string | undefined) => value?.trim() || undefined;

const serverEnvSchema = z.object({
  // Required: every page reads Strapi with this token
  BEARER_TOKEN: z.string().min(1),
  NEXT_PUBLIC_STRAPI_API_URL: z
    .string()
    .regex(/^https?:\/\/[^/]/, "must be an http(s) URL")
    .optional(),
  // Optional: only the feature that needs them degrades
  YOUTUBE_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  REVALIDATE_KEY: z.string().optional(),
  // Contact form recipient when Strapi's form_recipient_email is empty
  CONTACT_TO_EMAIL: z.string().optional(),
  // Shared with Strapi's preview handler; without it /api/preview rejects every request
  PREVIEW_SECRET: z.string().optional(),
});

// Each variable is read literally so NEXT_PUBLIC_* values can be inlined at build time
const parsed = serverEnvSchema.safeParse({
  BEARER_TOKEN: read(process.env.BEARER_TOKEN),
  NEXT_PUBLIC_STRAPI_API_URL: read(process.env.NEXT_PUBLIC_STRAPI_API_URL),
  YOUTUBE_API_KEY: read(process.env.YOUTUBE_API_KEY),
  RESEND_API_KEY: read(process.env.RESEND_API_KEY),
  REVALIDATE_KEY: read(process.env.REVALIDATE_KEY),
  CONTACT_TO_EMAIL: read(process.env.CONTACT_TO_EMAIL),
  PREVIEW_SECRET: read(process.env.PREVIEW_SECRET),
});

if (!parsed.success) {
  // Names and reasons only, never values
  const problems = parsed.error.issues.map((issue) => `${issue.path.join(".")} (${issue.message})`);
  throw new Error(`Invalid server environment variables: ${problems.join(", ")}`);
}

export const env = {
  ...parsed.data,
  NEXT_PUBLIC_STRAPI_API_URL: (
    parsed.data.NEXT_PUBLIC_STRAPI_API_URL ?? "http://127.0.0.1:1337"
  ).replace(/\/+$/, ""),
};
