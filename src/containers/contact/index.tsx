import Link from "next/link";
import { MailOpenIcon, PhoneCall } from "lucide-react";
import TitleSection from "@/components/TitleSection";
import FormSection from "./sections/FormSection";
import appRoutes from "@/config/constants/app_routes";

export default function ContactContainer() {
  return (
    <main className="container">
      <TitleSection
        backgroundText="contact"
        plainText="get in"
        coloredText="touch"
      />
      <div className="grid grid-flow-row-dense grid-cols-3 gap-12">
        <div className="">
          <h1 className="pb-4 text-3xl font-bold uppercase">
            Don&apos;t Be Shy!
          </h1>
          <p>
            Feel free to get in touch with me. I am always open to discussing
            new projects, creative ideas or opportunities to be part of your
            visions.
          </p>
          <div className="flex items-center gap-2 pt-6">
            <MailOpenIcon size={40} className="text-primary" />
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
          <div className="flex items-center gap-2 pt-6">
            <PhoneCall size={40} className="text-primary" />
            <div className="flex flex-col">
              <h3 className="uppercase text-opacity-30">call me</h3>
              <Link
                href={appRoutes.EXTERNAL.Tel}
                target="_blank"
                className="font-semibold"
              >
                {appRoutes.EXTERNAL.Tel.split(":")[1]}
              </Link>
            </div>
          </div>
        </div>
        {/* <div className="col-span-2">
          <input
            type="text"
            placeholder="YOUR NAME"
            className="rounded-full bg-muted px-6 py-3 outline-1 outline-primary focus-visible:outline"
          />
        </div> */}
        <FormSection className="col-span-2 sm:max-lg:pr-12" />
      </div>
    </main>
  );
}
