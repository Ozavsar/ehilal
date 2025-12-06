"use server";

import { EmailTemplate } from "@/components/email-template";
import { ROUTES } from "@/config/constants/app-routes";
import { Resend } from "resend";

export const submitAction = async (formData: FormData) => {
  console.log("submitting form data", formData);
  const rawFormData = {
    name: formData.get("name")!.toString(),
    email: formData.get("email")!.toString(),
    subject: formData.get("subject")!.toString(),
    message: formData.get("message")!.toString(),
  };

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: process.env.NEXT_PUBLIC_DOMAIN_MAIL!,
    to: ROUTES.EXTERNAL.MAIL,
    subject: rawFormData.subject,
    react: await EmailTemplate(rawFormData),
  });

  console.log(data);

  if (error) {
    console.error(error);
  }
};
