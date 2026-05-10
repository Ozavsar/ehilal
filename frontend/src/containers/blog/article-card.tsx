import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LuExternalLink } from "react-icons/lu";
import LinkButton from "@/components/link-button";

interface ArticleCardProps {
  thumbnailURL: string;
  title: string;
  externalURL: string;
  externalBlogSource: string;
  description: string;
  pubDate: string;
  blurDataURL?: string;
  isReadable?: boolean;
}

export default function ArticleCard({
  thumbnailURL,
  title,
  externalURL,
  externalBlogSource,
  description,
  pubDate,
  blurDataURL,
  isReadable,
}: ArticleCardProps) {
  const publishedMonth = pubDate.split(" ")[0];
  const publishedDay = pubDate.split(" ")[1].replace(",", "");
  const publishedYear = pubDate.split(" ")[2];
  const showYear = new Date().getFullYear().toString() !== publishedYear;

  const internalPath = `blog/${externalURL.split("/").pop()}`;

  const ConditionalLink = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) =>
    isReadable ? (
      <Link
        href={internalPath}
        title={`Read more about ${title}`}
        aria-label={`Read more about ${title}`}
        className={className}
      >
        {children}
      </Link>
    ) : (
      <a
        href={externalURL}
        target="_blank"
        rel="noopener noreferrer"
        title={`Read the full article on ${externalBlogSource}`}
        aria-label={`Read the full article on ${externalBlogSource}`}
        className={className}
      >
        {children}
      </a>
    );

  return (
    <Card className="h-full overflow-visible pt-0">
      <CardHeader className="relative overflow-visible px-0">
        <ConditionalLink className="overflow-hidden rounded-t-md">
          <Image
            src={thumbnailURL || "/images/blog/default-blog.jpg"}
            alt={`${title} Thumbnail`}
            title={`${title} Thumbnail`}
            width={800}
            height={800}
            blurDataURL={blurDataURL}
            placeholder={blurDataURL ? "blur" : "empty"}
            draggable={false}
            className="aspect-video object-cover transition-transform duration-500 select-none hover:scale-105"
          />
        </ConditionalLink>
        <div className="bg-primary text-primary-foreground before:border-b-primary absolute bottom-5 -left-2 isolate flex size-12 flex-col items-center justify-center shadow-md before:absolute before:-top-1.5 before:left-0.5 before:rotate-135 before:border-[6.5px] before:border-transparent before:shadow-md before:content-['']">
          <span className="text-sm leading-none font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            {publishedMonth}
          </span>
          <span className="text-lg leading-none font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            {publishedDay}
          </span>
          {showYear && (
            <span className="mt-0.5 text-[10px] leading-none font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
              {publishedYear}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ConditionalLink>
          <h3 className="h5 hover:text-primary mb-2 transition-colors duration-300">{title}</h3>
        </ConditionalLink>
        <p className="text-muted-foreground line-clamp-3 text-sm">{description}</p>
      </CardContent>
      <CardFooter className="mt-auto flex gap-4">
        {isReadable ? (
          <ConditionalLink
            className={buttonVariants({
              size: "sm",
              variant: "default",
            })}
          >
            Read Now!
          </ConditionalLink>
        ) : null}

        <LinkButton
          href={externalURL}
          target="_blank"
          rel="noopener noreferrer"
          title={`Read the full article on ${externalBlogSource}`}
        >
          {isReadable ? `or read on ${externalBlogSource}` : `Read on ${externalBlogSource}`}
          <span>
            <LuExternalLink />
          </span>
        </LinkButton>
      </CardFooter>
    </Card>
  );
}
