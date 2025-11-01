import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getCleanSlug, truncateDescription } from "@/lib/utils";
import type { IBlogPreview } from "@/types.d";
import Link from "next/link";

export default function ArticleCard({
  blurDataURL,
  thumbnailURL,
  title,
  mediumURL,
  description,
  pubDate,
}: IBlogPreview) {
  const rawSlug = mediumURL.split("/").pop() || "";
  const slug = getCleanSlug(rawSlug);
  return (
    <Card>
      <CardHeader>
        <Link href={`/blog/${slug}`}>
          <Image
            src={thumbnailURL || "/images/blog/default-blog.jpg"}
            alt={title}
            width={800}
            height={800}
            blurDataURL={blurDataURL ? blurDataURL : undefined}
            placeholder={blurDataURL ? "blur" : "empty"}
            className="aspect-video object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </CardHeader>
      <CardContent>
        <Link href={`/blog/${slug}`}>
          <h2 className="text-lg font-bold">{title}</h2>
        </Link>
        <p className="dark:text-gray-400 max-sm:text-sm">
          {truncateDescription(description!)}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/blog/${slug}`}>
          <span className="text-xs text-primary hover:underline">
            Read more...
          </span>
        </Link>
        <span className="text-xs text-gray-500">{pubDate}</span>
      </CardFooter>
    </Card>
  );
}
