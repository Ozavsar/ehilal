import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { truncateDescription } from "@/lib/utils";
import type { IBlog } from "@/types.d";
import LinkButton from "@/components/link-button";

export default function ArticleCard({
  blurDataURL,
  thumbnailURL,
  title,
  mediumURL,
  description,
  pubDate,
}: IBlog) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="h-fit">
        <a href={mediumURL} target="_blank">
          <Image
            src={thumbnailURL || "/images/blog/default-blog.jpg"}
            alt={title}
            width={800}
            height={800}
            blurDataURL={blurDataURL ? blurDataURL : undefined}
            placeholder={blurDataURL ? "blur" : "empty"}
            className="aspect-video object-cover transition-transform duration-300 hover:scale-105"
          />
        </a>
      </CardHeader>
      <CardContent>
        <a href={mediumURL} target="_blank">
          <h2 className="line-clamp-2 text-lg font-bold text-foreground">
            {title}
          </h2>
        </a>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
      <CardFooter className="mt-auto flex justify-between">
        <LinkButton href={mediumURL} target="_blank" rel="noopener noreferrer">
          Read on{" "}
          <span className="font-bold text-[#242424] dark:text-foreground">
            Medium
          </span>
        </LinkButton>
        <span className="text-xs text-muted-foreground">{pubDate}</span>
      </CardFooter>
    </Card>
  );
}
