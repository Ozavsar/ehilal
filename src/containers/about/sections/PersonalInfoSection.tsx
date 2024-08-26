"use client";

import Image from "next/image";
import { Download } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import StatCard from "../components/StatCard";

const personalInfoData = [
  { title: "name", value: "Elif Hilal" },
  { title: "surname", value: "Umucu" },
  { title: "Age", value: "27 Years" },
  { title: "Nationality", value: "Turkish" },
  { title: "Freelance", value: "Available" },
  { title: "Address", value: "Türkiye" },
  { title: "phone", value: "+905555555555" },
  { title: "Email", value: "elifhilal@mail.com" },
  { title: "Skype", value: "elif.umucu" },
  { title: "languages", value: "French, English" },
];

const statsData = [
  { value: "12", description: "years of experience" },
  { value: "97", description: "completed projects" },
  { value: "81", description: "Happy customers" },
  { value: "53", description: "awards won" },
];

const handleDownloadCV = () => {
  const link = document.createElement("a");
  link.href = "https://pdfobject.com/pdf/sample.pdf";
  link.target = "_blank";
  link.click();
};

export default function PersonalInfoSection() {
  return (
    <section className="container grid grid-cols-1 max-sm:pt-20 xl:grid-cols-2">
      <div className="mb-10 flex flex-col justify-between">
        <h1 className="pb-4 text-3xl font-bold uppercase">Personal Infos</h1>
        <Image
          src="/images/home/profile-picture.webp"
          className="xs:!hidden border-black-3 mx-auto mb-10 hidden size-52 rounded-full border-4 border-solid max-sm:block"
          width={270}
          height={270}
          alt="my-picture"
        />
        <ul className="grid grid-cols-2">
          {personalInfoData.map((item, index) => (
            <li key={index} className="flex pb-5 max-sm:flex-col">
              <span className="capitalize opacity-80">
                {item.title} {" :"}
              </span>
              <span className="font-semibold">&nbsp;{item.value}</span>
            </li>
          ))}
        </ul>
        <CustomButton
          text="Download CV"
          icon={Download}
          onClick={handleDownloadCV}
        />
      </div>
      <ul className="grid-auto-rows-min grid grid-cols-2 gap-2 sm:gap-6">
        {statsData.map((item, index) => (
          <StatCard
            key={index}
            value={item.value}
            description={item.description}
          />
        ))}
      </ul>
    </section>
  );
}
