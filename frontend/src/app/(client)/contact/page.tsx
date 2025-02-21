import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ContactContainer from "@/containers/contact";
import { getContactPageContent } from "@/lib/services/pages";
import { getSocialMediaLinks } from "@/lib/services";

export const metadata: Metadata = {
  title: "Contact",
};

const getCachedContactPageContent = unstable_cache(
  async () => {
    try {
      return await getContactPageContent();
    } catch (error) {
      console.error("Error fetching contact page content:", error);
      return null;
    }
  },
  ["contact-page-content"],
  {
    tags: ["contact-title"],
  },
);

const getCachedSocialMediaLinks = unstable_cache(
  async () => {
    try {
      return await getSocialMediaLinks();
    } catch (error) {
      console.error(
        "Error fetching social media links on contact page:",
        error,
      );
      return { email: "", twitter_x: "", linkedin: "" };
    }
  },
  ["social-media-links"],
  {
    tags: ["social-links"],
  },
);

export default async function ContactPage() {
  try {
    const [content, socialMediaLinks] = await Promise.all([
      getCachedContactPageContent(),
      getCachedSocialMediaLinks(),
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
