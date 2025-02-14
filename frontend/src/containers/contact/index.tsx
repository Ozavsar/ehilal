import Link from "next/link";
import { LuLinkedin, LuMail } from "react-icons/lu";
import { BsTwitterX } from "react-icons/bs";
import TitleSection from "@/components/title-section";
import FormSection from "./sections/form-section";
import { getSocialMediaLinks } from "@/lib/services";
import type { IStrapiContactPage } from "@/types.d";

interface IContactContainerProps {
  content: IStrapiContactPage;
}

export default async function ContactContainer({
  content,
}: IContactContainerProps) {
  const socailMediaLinks = await getSocialMediaLinks();
  return (
    <main className="container">
      <TitleSection
        backgroundText={content.page_title_background}
        text={content.page_title}
      />
      <div className="grid grid-flow-row-dense grid-cols-3 gap-12">
        <div className="max-md:col-span-3">
          <h1 className="pb-4 text-3xl font-bold uppercase">{content.title}</h1>
          <p>{content.description}</p>
          <div className="flex flex-col gap-8 py-6 text-sm max-md:items-center">
            <Link
              href={`mailto:${socailMediaLinks.email}`}
              target="_blank"
              className="flex items-center gap-4"
            >
              <LuMail size={40} className="text-primary" />
              <div className="flex flex-col">
                <h3 className="uppercase text-opacity-30">mail me</h3>
                <p className="font-semibold">{socailMediaLinks.email}</p>
              </div>
            </Link>
            <Link
              href={socailMediaLinks.twitter_x}
              target="_blank"
              className="flex items-center gap-4"
            >
              <BsTwitterX size={40} className="text-primary" />
              <div className="flex flex-col">
                <h3 className="uppercase text-opacity-30">Follow Me</h3>
                <p className="font-semibold">
                  {"@" + socailMediaLinks.twitter_x.split("/")[3]}
                </p>
              </div>
            </Link>
            <Link
              href={socailMediaLinks.linkedin}
              target="_blank"
              className="flex items-center gap-4"
            >
              <LuLinkedin size={40} className="text-primary" />
              <div className="flex flex-col">
                <h3 className="uppercase text-opacity-30">Connect with Me</h3>
                <p className="font-semibold capitalize">
                  {socailMediaLinks.linkedin.split("/")[4].replace(/-/g, " ")}
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
