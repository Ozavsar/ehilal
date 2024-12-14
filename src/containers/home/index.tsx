import Link from "next/link";
import Image from "next/image";
import CustomButton from "@/components/custom-button";
import AnimatedText from "@/components/animated-text";
import appRoutes from "@/config/constants/app-routes";

export default function HomeContainer() {
  const text =
    "I'm Elif, a DevRel Engineer at a blockchain company in the USA. I blend my passion for coding, blockchain, and personal growth to inspire others. With experiences across Turkey, Europe, and America, I share insights on technology, personal development, and blockchain education.";

  return (
    <main className="container flex min-h-screen items-center justify-center max-sm:-my-20">
      <Image
        src="/images/home/profile-picture.webp"
        className="fixed left-10 top-10 hidden h-[calc(100vh-80px)] w-1/3 animate-fade-in-elif rounded-3xl object-cover opacity-0 shadow-md shadow-slate-900 lg:block"
        width={700}
        height={700}
        alt="my-picture"
      />
      <div className="fixed -left-[83%] -top-1/2 -z-10 hidden h-[200%] w-full -rotate-[15deg] bg-primary lg:block" />

      <div className="flex max-w-[400px] flex-col gap-12 md:max-w-[580px] md:gap-24 lg:ml-[40%]">
        <Image
          src="/images/home/profile-picture.webp"
          className="xs:!hidden border-black-3 mx-auto hidden size-64 rounded-full border-4 border-solid max-lg:block"
          width={270}
          height={270}
          alt="my-picture"
        />
        <div className="flex flex-col gap-4 sm:gap-6 md:gap-10">
          <div className="flex w-fit gap-4">
            <span className="mt-4 h-1 w-6 rounded-md bg-primary sm:mt-6 sm:w-10" />
            <h1 className="text-nowrap text-2xl font-bold text-primary md:text-5xl">
              I&apos;m Elif Hilal Umucu Kara
              <span className="block text-foreground sm:mt-2">DevRel</span>
            </h1>
          </div>

          <div className="flex flex-col sm:gap-2">
            <AnimatedText
              text={text}
              className="mb-7 mt-4 text-sm leading-6 md:text-lg lg:mb-6 lg:mt-[2.5px] lg:leading-7"
            />

            <Link href={appRoutes.INTERNAL.About}>
              <CustomButton text="MORE ABOUT ME" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
