import TitleSection from "@/components/title-section";
import { PAGE_SEO } from "@/config/seo";
import FormSection from "./sections/form-section";
import InfoSection from "./sections/info-section";
import type { IStrapiContactPage } from "@/types";

interface IContactContainerProps {
  socialMediaLinks: {
    email: string;
    twitter_x: string;
    linkedin: string;
    youtube: string;
    instagram?: string | null;
  };
  content: IStrapiContactPage;
  // Karakod LinkedIn page from the Site Settings
  companyLinkedinUrl: string;
}

// Two balanced panes from expanded (840px): the intro and the channel list on the left, the form
// card beside both. From large (1200px) the intro spans the top, so the channel list and the form
// card (about the same height there) start and end on one line. Compact: intro, channels, form.
export default function ContactContainer({
  content,
  socialMediaLinks,
  companyLinkedinUrl,
}: IContactContainerProps) {
  // <main> is the (client) template's
  return (
    <>
      <TitleSection
        as="h1"
        backgroundText={content.page_title_background}
        text={content.page_title}
        subtitle={PAGE_SEO.CONTACT.subtitle}
      />
      <div className="container grid grid-cols-1 gap-6 pb-8 sm:pb-12 md:grid-cols-2 md:grid-rows-[auto_1fr] md:gap-x-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-y-8">
        {/* @starting-style fade-in: visible without JS, still for reduced motion */}
        <div className="ease-emphasized-decelerate flex max-w-3xl flex-col gap-2 transition-[opacity,translate] duration-500 motion-reduce:transition-none md:col-start-1 md:row-start-1 lg:col-span-2 starting:-translate-y-2 starting:opacity-0">
          <h2 className="type-headline-medium sm:type-headline-large">{content.title}</h2>
          <p className="type-body-large text-on-surface-variant">{content.description}</p>
        </div>
        <InfoSection
          socialMediaLinks={socialMediaLinks}
          companyLinkedinUrl={companyLinkedinUrl}
          className="md:col-start-1 md:row-start-2"
        />
        <FormSection className="md:col-start-2 md:row-span-2 md:row-start-1 lg:row-span-1 lg:row-start-2" />
      </div>
    </>
  );
}
