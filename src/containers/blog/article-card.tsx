import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { truncateDescription } from "@/lib/utils";
import type { IBlog } from "@/types.d";

export default function ArticleCard({
  thumbnailURL,
  title,
  mediumURL,
  description,
}: IBlog) {
  const localArticleUrl = `/blog/${mediumURL.split("/").pop()}`;
  return (
    <Card>
      <CardHeader>
        <Link href={localArticleUrl}>
          <Image
            src={thumbnailURL || "/images/blog/default-blog.jpg"}
            alt={title}
            width={800}
            height={800}
            className="aspect-video object-cover transition-transform duration-300 hover:scale-110"
          />
        </Link>
      </CardHeader>
      <CardContent>
        <Link href={localArticleUrl}>
          <h2 className="text-lg font-bold">{title}</h2>
        </Link>
        <p className="dark:text-gray-400">
          {truncateDescription(description!)}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={localArticleUrl}>
          <span className="text-sm text-primary hover:underline">
            Read more...
          </span>
        </Link>
      </CardFooter>
    </Card>
  );
}
