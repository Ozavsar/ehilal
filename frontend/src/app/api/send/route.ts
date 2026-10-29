import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";
import { getTheme } from "@/lib/services";

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
    // Match the site's colors; the mail still goes out with the fallback if Strapi is unreachable
    const theme = await getTheme().catch(() => null);

    const { data, error } = await resend.emails.send({
      from: "hello@ehilal.net",
      // CONTACT_TO_EMAIL overrides the recipient (e.g. to test the form locally)
      to: process.env.CONTACT_TO_EMAIL || "canozfuttu07@gmail.com",
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
