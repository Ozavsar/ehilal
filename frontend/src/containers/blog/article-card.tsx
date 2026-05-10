import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { IBlogPreview } from "@/types.d";
import LinkButton from "@/components/link-button";
import Link from "next/link";
import { getCleanSlug } from "@/lib/utils";

export default function ArticleCard({
  blurDataURL,
  thumbnailURL,
  title,
  description,
  mediumURL,
  pubDate,
}: IBlogPreview) {
  const rawSlug = mediumURL.split("/").pop() || "";
  const slug = getCleanSlug(rawSlug);
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="h-fit">
        <Link href={`/blog/${slug}`}>
          <Image
            src={thumbnailURL || "/images/blog/default-blog.jpg"}
            alt={title}
            width={800}
            height={800}
            blurDataURL={blurDataURL ? blurDataURL : undefined}
            placeholder={blurDataURL ? "blur" : "empty"}
            className="aspect-video object-cover transition-transform duration-500 hover:scale-105"
          />
        </Link>
      </CardHeader>
      <CardContent>
        <Link href={`/blog/${slug}`}>
          <h2 className="text-foreground line-clamp-2 text-lg font-bold">{title}</h2>
        </Link>
        <p className="text-muted-foreground line-clamp-2 text-sm">{description}</p>
      </CardContent>
      <CardFooter className="mt-auto flex justify-between">
        <LinkButton href={mediumURL} rel="noopener noreferrer">
          Read on <span className="dark:text-foreground font-bold text-[#242424]">Medium</span>
        </LinkButton>
        <span className="text-muted-foreground text-xs">{pubDate}</span>
      </CardFooter>
    </Card>
  );
}
