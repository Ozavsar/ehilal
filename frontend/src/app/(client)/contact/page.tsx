import { Metadata } from "next";
import ContactContainer from "@/containers/contact";
import { getContactPageContent } from "@/lib/services/pages";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function Contact() {
  const content = await getContactPageContent();
  return <ContactContainer content={content} />;
}
