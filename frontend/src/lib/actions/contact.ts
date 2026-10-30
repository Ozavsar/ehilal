"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";
import { EmailTemplate } from "@/components/email-template";
import { env } from "@/config/env";
import { getTheme } from "@/lib/services";
import { getContactPageContent } from "@/lib/services/pages";
import {
  CONTACT_HONEYPOT_FIELD,
  contactFormSchema,
  type ContactFormState,
} from "@/lib/validations/contact";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const SUCCESS_MESSAGE = "Thanks! Your message has been sent.";
const SEND_ERROR_MESSAGE =
  "Sorry, your message could not be sent. Please try again later or reach out by email.";

// In-memory limiter; enough for the single PM2 process. Kept on globalThis so dev reloads don't reset it.
const store = globalThis as typeof globalThis & { contactSubmissions?: Map<string, number[]> };
const submissions = (store.contactSubmissions ??= new Map<string, number[]>());

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (submissions.get(ip) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  const limited = recent.length >= RATE_LIMIT_MAX;
  if (!limited) recent.push(now);
  submissions.set(ip, recent);

  // Drop idle IPs so the map can't grow without bound
  if (submissions.size > 1000) {
    for (const [key, times] of submissions) {
      const last = times.at(-1);
      if (last === undefined || now - last >= RATE_LIMIT_WINDOW_MS) submissions.delete(key);
    }
  }
  return limited;
}

async function getClientIp() {
  const headerList = await headers();
  // x-real-ip is set by the reverse proxy; otherwise use the last x-forwarded-for hop,
  // which is the one our own proxy appended (earlier hops can be spoofed by the client)
  const lastForwardedHop = headerList.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  return headerList.get("x-real-ip")?.trim() || lastForwardedHop || "unknown";
}

function getField(formData: FormData, name: string) {
  const value = formData.get(name);
  // Browsers submit line breaks as CRLF; normalise so lengths match the client-side check
  return typeof value === "string" ? value.replace(/\r\n?/g, "\n") : "";
}

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  if (isRateLimited(await getClientIp())) {
    return {
      status: "error",
      message: "You have sent several messages in a short time. Please try again in a few minutes.",
    };
  }

  // Honeypot: real visitors never see this field, so pretend it worked and send nothing
  if (getField(formData, CONTACT_HONEYPOT_FIELD)) {
    return { status: "success", message: SUCCESS_MESSAGE };
  }

  const parsed = contactFormSchema.safeParse({
    name: getField(formData, "name"),
    email: getField(formData, "email"),
    subject: getField(formData, "subject"),
    message: getField(formData, "message"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please check the highlighted fields and try again.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    // Theme colors and recipient come from Strapi; the mail still goes out with fallbacks if Strapi is unreachable
    const [theme, contactPage] = await Promise.all([
      getTheme().catch(() => null),
      getContactPageContent().catch(() => null),
    ]);

    // Recipient is managed in Strapi (Contact Page); CONTACT_TO_EMAIL is only the fallback
    const to = contactPage?.form_recipient_email || env.CONTACT_TO_EMAIL;
    if (!to) {
      console.error(
        "Contact form recipient is not configured (Strapi form_recipient_email or CONTACT_TO_EMAIL)",
      );
      return { status: "error", message: SEND_ERROR_MESSAGE };
    }

    const resend = new Resend(env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "hello@ehilal.net",
      to,
      replyTo: data.email,
      // Collapse whitespace so the subject stays a single header line
      subject: `[ehilal.net] ${data.subject.replace(/\s+/g, " ")}`,
      react: await EmailTemplate({ ...data, primaryColor: theme?.primaryDark || undefined }),
    });

    if (error) {
      console.error("Contact form email was rejected by Resend:", error.name, error.message);
      return { status: "error", message: SEND_ERROR_MESSAGE };
    }

    return { status: "success", message: SUCCESS_MESSAGE };
  } catch (error) {
    console.error(
      "Contact form email could not be sent:",
      error instanceof Error ? error.message : "unknown error",
    );
    return { status: "error", message: SEND_ERROR_MESSAGE };
  }
}
