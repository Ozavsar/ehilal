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
      <div className="grid grid-flow-row-dense grid-cols-3 gap-12">
        <InfoSection content={content} socialMediaLinks={socialMediaLinks} />
        <FormSection className="col-span-3 sm:max-lg:pr-12 md:col-span-2" />
      </div>
    </main>
  );
}
