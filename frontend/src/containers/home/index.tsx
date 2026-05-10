import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import AnimatedText from "@/components/animated-text";
import CustomButton from "@/components/custom-button";
import SocialLinks from "@/components/social-links";
import { ROUTES } from "@/config/constants/app-routes";
import type { IStrapiHomePage } from "@/types.d";

interface IHomeContainerProps {
  content: IStrapiHomePage;
}

export default async function HomeContainer({ content }: IHomeContainerProps) {
  return (
    <main className="container flex min-h-screen items-center justify-center max-sm:py-0 max-sm:pb-4">
      <Image
        src={content.hero_image.url}
        className="animate-fade-in-elif fixed top-10 left-10 hidden h-[calc(100vh-80px)] w-1/3 rounded-3xl object-cover opacity-0 shadow-2xl xl:block"
        width={700}
        height={700}
        blurDataURL={content.hero_image.blurDataURL}
        placeholder={"blur"}
        alt="Elif Hilal's Hero Image"
      />

      <div className="bg-primary fixed -top-1/2 -left-[83%] -z-10 hidden h-[200%] w-full -rotate-15 lg:block" />

      <div className="flex max-w-md flex-col gap-8 max-sm:gap-4 md:max-w-150 md:gap-12 lg:ml-[10%] xl:ml-[35%]">
        <Avatar className="border-primary size-52 self-center border-4 xl:hidden">
          <AvatarImage
            src={content.hero_image.url}
            alt="Elif Hilal's Hero Avatar"
            className="object-cover"
          />
          <AvatarFallback className="text-5xl">EH</AvatarFallback>
        </Avatar>

        <div className="flex w-full flex-col items-start sm:gap-6 md:items-center md:gap-10">
          <div className="flex gap-4 md:justify-center">
            <span className="bg-primary mt-4 h-1 w-6 rounded-md sm:mt-6 sm:w-10" />
            <h1 className="text-primary text-2xl font-bold sm:text-4xl md:text-5xl">
              {content.greeting}
            </h1>
          </div>

          <div className="flex flex-col sm:gap-2">
            <AnimatedText
              text={content.introduction}
              className="mt-4 mb-7 text-sm leading-6 md:text-lg lg:mt-[2.5px] lg:mb-6 lg:leading-7"
            />

            <div className="flex gap-4 max-sm:flex-col">
              <Link href={ROUTES.INTERNAL.CONFERENCES} className="max-sm:self-center">
                <CustomButton text="MORE ABOUT ME" />
              </Link>
              <SocialLinks />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
