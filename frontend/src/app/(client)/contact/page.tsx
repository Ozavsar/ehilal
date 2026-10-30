import { notFound } from "next/navigation";
import { Metadata } from "next";
import ContactContainer from "@/containers/contact";
import { getContactPageContent } from "@/lib/services/pages";
import { getSocialMediaLinks } from "@/lib/services";
import { orNotFound } from "@/lib/api/fetchAPI";
import { buildMeta } from "@/lib/metadata";
import { SITE_NAME, SITE_URL } from "@/config/site";

export default async function ContactPage() {
  // Missing CMS entries → 404; Strapi being down → error.tsx
  const [content, socialMediaLinks] = await Promise.all([
    orNotFound(getContactPageContent()),
    orNotFound(getSocialMediaLinks()),
  ]);

  if (!content || !socialMediaLinks) {
    notFound();
  }

  return <ContactContainer content={content} socialMediaLinks={socialMediaLinks} />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMeta({
    title: "Contact",
    description: `Get in touch with ${SITE_NAME} — reach out for collaborations, speaking invitations, or professional inquiries.`,
    path: "/contact",
    type: "website",
    image: {
      url: `${SITE_URL}/api/og?title=contact`,
      alt: `Contact ${SITE_NAME}`,
    },
  });
}
