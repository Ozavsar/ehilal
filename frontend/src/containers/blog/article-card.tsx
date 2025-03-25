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
  return (
    <Card>
      <CardHeader>
        <a href={mediumURL} target="_blank">
          <Image
            src={thumbnailURL || "/images/blog/default-blog.jpg"}
            alt={title}
            width={800}
            height={800}
            className="aspect-video object-cover transition-transform duration-300 hover:scale-110"
          />
        </a>
      </CardHeader>
      <CardContent>
        <a href={mediumURL} target="_blank">
          <h2 className="text-lg font-bold">{title}</h2>
        </a>
        <p className="dark:text-gray-400 max-sm:text-sm">
          {truncateDescription(description!)}
        </p>
      </CardContent>
      <CardFooter>
        <a href={mediumURL} target="_blank">
          <span className="max-sm:text-xs text-sm text-primary hover:underline">
            Read more...
          </span>
        </a>
      </CardFooter>
    </Card>
  );
}
