import { z } from "zod";

// Shared by the contact form (client) and the sendContactMessage server action
export const CONTACT_LIMITS = {
  name: { min: 2, max: 50 },
  email: { max: 254 },
  subject: { min: 5, max: 100 },
  message: { min: 5, max: 2000 },
} as const;

// Hidden field that only bots fill in
export const CONTACT_HONEYPOT_FIELD = "website";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(
      CONTACT_LIMITS.name.min,
      `Please enter your name (at least ${CONTACT_LIMITS.name.min} characters).`,
    )
    .max(CONTACT_LIMITS.name.max, `Name should not exceed ${CONTACT_LIMITS.name.max} characters.`),
  email: z
    .string()
    .trim()
    .max(
      CONTACT_LIMITS.email.max,
      `Email should not exceed ${CONTACT_LIMITS.email.max} characters.`,
    )
    // z.email() would check the untrimmed value, so trim first and pipe the result into it
    .pipe(z.email("Please enter a valid email address.")),
  subject: z
    .string()
    .trim()
    .min(
      CONTACT_LIMITS.subject.min,
      `Please enter a subject (at least ${CONTACT_LIMITS.subject.min} characters).`,
    )
    .max(
      CONTACT_LIMITS.subject.max,
      `Subject should not exceed ${CONTACT_LIMITS.subject.max} characters.`,
    ),
  message: z
    .string()
    .trim()
    .min(
      CONTACT_LIMITS.message.min,
      `Please enter your message (at least ${CONTACT_LIMITS.message.min} characters).`,
    )
    .max(
      CONTACT_LIMITS.message.max,
      `Message should not exceed ${CONTACT_LIMITS.message.max} characters.`,
    ),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type ContactFormField = keyof ContactFormValues;

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<ContactFormField, string[]>>;
};
