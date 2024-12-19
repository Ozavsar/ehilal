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
    <Card className="row-span-3 grid grid-rows-subgrid gap-0 overflow-hidden rounded-[5px] border border-muted bg-muted">
      <CardHeader className="overflow-hidden border-b-8 border-primary bg-primary p-0">
        <Link href={localArticleUrl}>
          <Image
            src={thumbnailURL || "/images/blog/default-blog.jpg"}
            alt={title}
            width={800}
            height={800}
            className="aspect-square object-cover transition-transform duration-300 hover:scale-110"
          />
        </Link>
      </CardHeader>
      <CardContent className="row-span-1 flex flex-col gap-2 p-4 pb-2">
        <Link href={localArticleUrl}>
          <h2 className="text-lg font-bold">{title}</h2>
        </Link>
        <p className="dark:text-gray-400">
          {truncateDescription(description!)}
        </p>
      </CardContent>
      <CardFooter className="row-span-1 flex justify-end p-4 pt-1">
        <Link href={localArticleUrl}>
          <span className="text-sm text-primary hover:underline">
            Read more...
          </span>
        </Link>
      </CardFooter>
    </Card>
  );
}
