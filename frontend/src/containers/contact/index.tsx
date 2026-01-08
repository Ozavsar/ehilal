import TitleSection from "@/components/title-section";
import FormSection from "./sections/form-section";
import InfoSection from "./sections/info-section";
import type { IStrapiContactPage } from "@/types.d";

interface IContactContainerProps {
  socialMediaLinks: {
    email: string;
    twitter_x: string;
    linkedin: string;
    youtube: string;
  };
  content: IStrapiContactPage;
}

export default async function ContactContainer({
  content,
  socialMediaLinks,
}: IContactContainerProps) {
  return (
    <main className="container">
      <TitleSection
        backgroundText={content.page_title_background}
        text={content.page_title}
      />
      <div className="grid grid-flow-row-dense grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
        <InfoSection content={content} socialMediaLinks={socialMediaLinks} />
        <FormSection className="col-span-1 md:col-span-2 md:pl-8" />
      </div>
    </main>
  );
}
