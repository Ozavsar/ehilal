import { notFound } from "next/navigation";
import { Metadata } from "next";
import ContactContainer from "@/containers/contact";
import { getContactPageContent } from "@/lib/services/pages";
import { getSiteSettings, getSocialMediaLinks } from "@/lib/services";
import { orNotFound } from "@/lib/api/fetchAPI";
import { buildMeta } from "@/lib/metadata";
import { SITE_URL } from "@/config/site";

export default async function ContactPage() {
  // Missing CMS entries → 404; Strapi being down → error.tsx
  const [content, socialMediaLinks, site] = await Promise.all([
    orNotFound(getContactPageContent()),
    orNotFound(getSocialMediaLinks()),
    getSiteSettings(),
  ]);

  if (!content || !socialMediaLinks) {
    notFound();
  }

  return (
    <ContactContainer
      content={content}
      socialMediaLinks={socialMediaLinks}
      companyLinkedinUrl={site.karakodLinkedinUrl}
    />
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSiteSettings();
  return buildMeta({
    title: "Contact",
    description: `Get in touch with ${siteName} — reach out for collaborations, speaking invitations, or professional inquiries.`,
    path: "/contact",
    type: "website",
    image: {
      url: `${SITE_URL}/api/og?title=contact`,
      alt: `Contact ${siteName}`,
    },
  });
}
