import CustomButton from "@/components/CustomButton";
import { Button } from "@/components/ui/button";
import { ArrowBigRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomeContainer() {
  return (
    <main>
      <div className="relative flex h-screen w-screen flex-col items-center justify-center max-sm:w-auto">
        <Image
          src="/images/home/profile-picture.webp"
          className="fixed left-10 top-10 hidden h-[calc(100vh-80px)] w-1/3 rounded-3xl object-cover shadow-md shadow-slate-900 custom-lg:block"
          width={700}
          height={700}
          alt="my-picture"
        />
        <div className="fixed -left-[83%] -top-1/2 -z-10 hidden h-[200%] w-full -rotate-[15deg] bg-primary custom-lg:block" />

        <div className="custom-lg:ml-[28%] custom-lg:w-2/3">
          <div className="mx-auto flex max-w-[400px] flex-col gap-12 md:max-w-[580px] md:gap-24">
            <Image
              src="/images/home/profile-picture.webp"
              className="xs:!hidden border-black-3 mx-auto hidden size-64 rounded-full border-4 border-solid max-custom-lg:block"
              width={270}
              height={270}
              alt="my-picture"
            />
            <div className="flex flex-col gap-4 sm:gap-6 md:gap-10">
              <div className="flex w-fit gap-4 px-2">
                <span className="mt-4 h-1 w-6 rounded-md bg-primary sm:mt-6 sm:w-10" />
                <h1 className="text-nowrap text-2xl font-bold text-primary sm:text-3xl md:text-5xl">
                  I&apos;m Elif Hilal Umucu
                  <span className="block text-foreground sm:mt-2">
                    Advocate
                  </span>
                </h1>
              </div>
              <div className="flex flex-col sm:gap-2">
                <p className="mb-7 mt-4 px-2 leading-6 md:text-lg custom-lg:mb-6 custom-lg:mt-[2.5px] custom-lg:leading-7">
                  I&apos;m Elif, a DevRel Engineer at a blockchain company in
                  the USA. I blend my passion for coding, blockchain, and
                  personal growth to inspire others. With experiences across
                  Turkey, Europe, and America, I share insights on technology,
                  personal development, and blockchain education.
                </p>
                <Link href="/about">
                  <CustomButton text="MORE ABOUT ME" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
