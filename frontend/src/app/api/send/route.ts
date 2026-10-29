import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";
import { getTheme } from "@/lib/services";
import { getContactPageContent } from "@/lib/services/pages";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const formData = await req.formData();
  try {
    const rawFormData = {
      name: formData.get("name")!.toString(),
      email: formData.get("email")!.toString(),
      subject: formData.get("subject")!.toString(),
      message: formData.get("message")!.toString(),
    };

    const resend = new Resend(process.env.RESEND_API_KEY);
    // Theme colors and recipient come from Strapi; the mail still goes out with fallbacks if Strapi is unreachable
    const [theme, contactPage] = await Promise.all([
      getTheme().catch(() => null),
      getContactPageContent().catch(() => null),
    ]);

    // Recipient is managed in Strapi (Contact Page); CONTACT_TO_EMAIL is only the fallback
    const to = contactPage?.form_recipient_email || process.env.CONTACT_TO_EMAIL;
    if (!to) {
      console.error(
        "Contact form recipient is not configured (Strapi form_recipient_email or CONTACT_TO_EMAIL)",
      );
      return Response.json({ error: "Recipient not configured" }, { status: 500 });
    }

    const { data, error } = await resend.emails.send({
      from: "hello@ehilal.net",
      to,
      replyTo: rawFormData.email,
      subject: rawFormData.subject,
      react: await EmailTemplate({ ...rawFormData, primaryColor: theme?.primaryDark || undefined }),
    });

    console.log(data);
    console.log(error);

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
