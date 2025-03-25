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

export default function HomeContainer({ content }: IHomeContainerProps) {
  return (
    <main className="container flex min-h-screen items-center justify-center max-sm:-my-20">
      <Image
        src={content.hero_image.url}
        className="fixed left-10 top-10 hidden h-[calc(100vh-80px)] w-1/3 animate-fade-in-elif rounded-3xl object-cover opacity-0 shadow-md shadow-slate-900 lg:block"
        width={700}
        height={700}
        alt="my-picture"
      />
      <div className="fixed -left-[83%] -top-1/2 -z-10 hidden h-[200%] w-full -rotate-[15deg] bg-primary lg:block" />

      <div className="flex max-w-[400px] flex-col gap-12 max-sm:gap-6 md:max-w-[580px] md:gap-24 lg:ml-[40%]">
        <Avatar className="size-52 self-center border-4 border-primary sm:hidden">
          <AvatarImage src={content.hero_image.url} alt="Profile Picture" />
          <AvatarFallback>EH</AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-center sm:gap-6 md:gap-10">
          <div className="flex w-fit justify-center gap-4">
            <span className="mt-4 h-1 w-6 rounded-md bg-primary sm:mt-6 sm:w-10" />
            <h1 className="text-nowrap text-xl font-bold text-primary sm:text-2xl md:text-5xl">
              {content.greeting}
            </h1>
          </div>

          <div className="flex flex-col sm:gap-2">
            <AnimatedText
              text={content.introduction}
              className="mb-7 mt-4 text-sm leading-6 md:text-lg lg:mb-6 lg:mt-[2.5px] lg:leading-7"
            />

            <div className="flex gap-4 max-sm:flex-col">
              <Link
                href={ROUTES.INTERNAL.CONFERENCES}
                className="max-sm:self-center"
              >
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
