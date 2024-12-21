import Link from "next/link";
import { MailOpenIcon, PhoneCall } from "lucide-react";
import TitleSection from "@/components/title-section";
import FormSection from "./sections/form-section";
import appRoutes from "@/config/constants/app-routes";

export default function ContactContainer() {
  return (
    <main className="container">
      <TitleSection
        backgroundText="contact"
        plainText="get in"
        coloredText="touch"
      />
      <div className="grid grid-flow-row-dense grid-cols-3 gap-12">
        <div className="max-md:col-span-3">
          <h1 className="pb-4 text-3xl font-bold uppercase">
            Don&apos;t Be Shy!
          </h1>
          <p>
            Feel free to get in touch with me. I am always open to discussing
            new projects, creative ideas or opportunities to be part of your
            visions.
          </p>
          <div className="flex flex-col gap-6 py-6 max-md:items-center">
            <div className="flex items-center gap-2">
              <MailOpenIcon className="size-10 text-primary" />
              <div className="flex flex-col">
                <h3 className="uppercase text-opacity-30">mail me</h3>
                <Link
                  href={appRoutes.EXTERNAL.Mail}
                  target="_blank"
                  className="font-semibold"
                >
                  {appRoutes.EXTERNAL.Mail.split(":")[1]}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <FormSection className="col-span-3 sm:max-lg:pr-12 md:col-span-2" />
      </div>
    </main>
  );
}
