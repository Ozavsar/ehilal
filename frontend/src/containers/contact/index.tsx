import Link from "next/link";
import { LuLinkedin, LuMail, LuYoutube } from "react-icons/lu";
import { BsTwitterX } from "react-icons/bs";
import TitleSection from "@/components/title-section";
import FormSection from "./sections/form-section";
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
        <div className="max-md:col-span-3">
          <h1 className="pb-4 text-2xl font-bold uppercase sm:text-3xl">
            {content.title}
          </h1>
          <p className="max-sm:text-sm">{content.description}</p>
          <div className="flex flex-col gap-8 py-6 text-sm max-md:items-center max-sm:items-start">
            <Link
              href={`mailto:${socialMediaLinks.email}`}
              target="_blank"
              className="flex items-center gap-4"
            >
              <LuMail className="size-10 text-primary" />
              <div className="flex flex-col">
                <h3 className="uppercase text-opacity-30">mail me</h3>
                <p className="font-semibold">{socialMediaLinks.email}</p>
              </div>
            </Link>
            <Link
              href={socialMediaLinks.twitter_x}
              target="_blank"
              className="flex items-center gap-4"
            >
              <BsTwitterX className="size-10 text-primary" />
              <div className="flex flex-col">
                <h3 className="uppercase text-opacity-30">Follow Me</h3>
                <p className="font-semibold">
                  {"@" + socialMediaLinks.twitter_x.split("/")[3]}
                </p>
              </div>
            </Link>
            <Link
              href={socialMediaLinks.linkedin}
              target="_blank"
              className="flex items-center gap-4"
            >
              <LuLinkedin className="size-10 text-primary" />
              <div className="flex flex-col">
                <h3 className="uppercase text-opacity-30">Connect with Me</h3>
                <p className="font-semibold capitalize">
                  {socialMediaLinks.linkedin.split("/")[4].replace(/-/g, " ")}
                </p>
              </div>
            </Link>
            <Link
              href={socialMediaLinks.youtube || "#"}
              target="_blank"
              className="flex items-center gap-4"
            >
              <LuYoutube className="size-10 text-primary" />
              <div className="flex flex-col">
                <h3 className="uppercase text-opacity-30">Subscribe</h3>
                <p className="font-semibold">
                  {socialMediaLinks.youtube?.split("/")[3] || "@elifhilalumucu"}
                </p>
              </div>
            </Link>
          </div>
        </div>
        <FormSection className="col-span-3 sm:max-lg:pr-12 md:col-span-2" />
      </div>
    </main>
  );
}
