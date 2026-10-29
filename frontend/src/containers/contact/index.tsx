import TitleSection from "@/components/title-section";
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
}

export default async function ContactContainer({
  content,
  socialMediaLinks,
}: IContactContainerProps) {
  return (
    <main className="container">
      <TitleSection backgroundText={content.page_title_background} text={content.page_title} />
      <div className="grid grid-flow-row-dense grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
        {/* Pass only the displayed fields so form_recipient_email is not serialized into the page */}
        <InfoSection
          content={{ title: content.title, description: content.description }}
          socialMediaLinks={socialMediaLinks}
        />
        <FormSection className="col-span-1 md:col-span-2 md:pl-8" />
      </div>
    </main>
  );
}
