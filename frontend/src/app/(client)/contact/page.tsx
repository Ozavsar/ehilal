import { notFound } from "next/navigation";
import ContactContainer from "@/containers/contact";
import { getContactPageContent } from "@/lib/services/pages";
import { getSocialMediaLinks } from "@/lib/services";
import { Metadata } from "next";
import { buildMeta } from "@/lib/metadata";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ehilal.net";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Elif Hilal Kara";

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

export async function generateMetadata(): Promise<Metadata> {
  try {
    return buildMeta({
      title: "Contact",
      description:
        "Get in touch with Elif Hilal Kara — reach out for collaborations, speaking invitations, or professional inquiries.",
      path: "/contact",
      type: "website",
      image: {
        url: `${SITE_URL}/api/og?title=contact`,
        alt: `Contact ${SITE_NAME}`,
      },
    });
  } catch (error) {
    console.error("Error generating metadata for Contact page:", error);
    return buildMeta({
      title: "Contact",
      description:
        "Connect with Elif Hilal Kara — for collaborations, inquiries, or networking.",
      path: "/contact",
      type: "website",
      image: {
        url: `${SITE_URL}/api/og?title=contact`,
        alt: `Contact ${SITE_NAME}`,
      },
    });
  }
}
