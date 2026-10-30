import { notFound } from "next/navigation";
import { Metadata } from "next";
import ContactContainer from "@/containers/contact";
import { getContactPageContent } from "@/lib/services/pages";
import { getSiteSettings, getSocialMediaLinks } from "@/lib/services";
import { orNotFound } from "@/lib/api/fetchAPI";
import { breadcrumbJsonLd, buildPageMeta, jsonLdGraph } from "@/lib/metadata";
import { INTERNAL_ROUTES } from "@/config/constants/app-routes";
import { PAGE_SEO } from "@/config/seo";
import JsonLd from "@/components/json-ld";

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
    <>
      <JsonLd
        data={jsonLdGraph(
          breadcrumbJsonLd([
            { name: INTERNAL_ROUTES.CONTACT.label, path: INTERNAL_ROUTES.CONTACT.path },
          ]),
        )}
      />
      <ContactContainer
        content={content}
        socialMediaLinks={socialMediaLinks}
        companyLinkedinUrl={site.karakodLinkedinUrl}
      />
    </>
  );
}

export function generateMetadata(): Promise<Metadata> {
  return buildPageMeta(PAGE_SEO.CONTACT, INTERNAL_ROUTES.CONTACT.path);
}
