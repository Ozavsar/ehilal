import { notFound } from "next/navigation";
import { Metadata } from "next";
import ContactContainer from "@/containers/contact";
import { getContactPageContent } from "@/lib/services/pages";
import { getSocialMediaLinks } from "@/lib/services";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContactPageContent();
  const title = content?.SEO_title || "Contact";
  const description =
    content?.SEO_description ||
    "Get in touch with Elif Hilal Umucu through email or social media.";
  return {
    title,
    description,
  };
}

export default async function ContactPage() {
  try {
    const [content, socialMediaLinks] = await Promise.all([
      getContactPageContent(),
      getSocialMediaLinks(),
    ]);

    if (!content) {
      return notFound();
    }

    return (
      <ContactContainer content={content} socialMediaLinks={socialMediaLinks} />
    );
  } catch (error) {
    console.error("Error in Contact page:", error);
    return notFound();
  }
}
