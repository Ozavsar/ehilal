import { EmailTemplate } from "@/components/email-template";
import { Resend } from "resend";

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

    const { data, error } = await resend.emails.send({
      from: "hello@ehilal.net",
      to: "canozfuttu07@gmail.com",
      subject: rawFormData.subject,
      react: await EmailTemplate(rawFormData),
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
