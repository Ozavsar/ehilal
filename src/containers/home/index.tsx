import Image from "next/image";

export default function HomeContainer() {
  return (
    <main>
      <div className="relative flex h-screen w-screen items-center justify-center">
        <Image
          src="/images/home/profile-picture.webp"
          className="custom-lg:block fixed left-10 top-10 hidden h-[calc(100vh-80px)] w-1/3 rounded-3xl object-cover shadow-md shadow-slate-900"
          width={700}
          height={700}
          alt="my-picture"
        />
        <div className="custom-lg:block bg-primary fixed -left-[83%] -top-1/2 -z-10 hidden h-[200%] w-full -rotate-[15deg]" />

        <div className="custom-lg:ml-[28%] custom-lg:w-2/3">
          <div className="mx-auto flex max-w-[400px] flex-col gap-12 md:max-w-[580px] md:gap-24">
            <Image
              src="/images/home/profile-picture.webp"
              className="xs:!hidden border-black-3 max-custom-lg:block mx-auto hidden size-64 rounded-full border-4 border-solid"
              width={270}
              height={270}
              alt="my-picture"
            />
            <div className="flex flex-col gap-4 sm:gap-6 md:gap-10">
              <div className="flex w-fit gap-6 px-2">
                <span className="bg-primary mt-8 h-1 w-8 rounded-md sm:w-10" />
                <h1 className="text-primary text-nowrap text-2xl font-bold leading-tight sm:text-3xl md:text-5xl">
                  I'm Elif Hilal Mumcu
                  <span className="text-foreground block">Advocate</span>
                </h1>
              </div>

              <p className="custom-lg:mb-6 custom-lg:mt-[2.5px] custom-lg:leading-7 mb-7 mt-4 px-2 leading-9 md:text-lg">
                I'm Elif, a DevRel Engineer at a blockchain company in the USA.
                I blend my passion for coding, blockchain, and personal growth
                to inspire others. With experiences across Turkey, Europe, and
                America, I share insights on technology, personal development,
                and blockchain education.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
