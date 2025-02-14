import Image from "next/image";
import { LuStar, LuUsers } from "react-icons/lu";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ICourse } from "@/types.d";

export default function CourseCard({
  thumbnailURL,
  title,
  udemyURL,
  rating,
  headline,
  contentInfo,
  numLectures,
  instructionalLevel,
  numReviews,
}: ICourse) {
  return (
    <Card>
      <CardHeader>
        <a href={udemyURL} target="_blank" rel="noopener noreferrer">
          <Image
            src={thumbnailURL || "/images/blog/default-blog.jpg"}
            alt={title || ""}
            width={800}
            height={800}
            className="aspect-video object-cover transition-transform duration-300 hover:scale-110"
          />
        </a>
      </CardHeader>
      <CardContent>
        <a href={udemyURL} target="_blank" rel="noopener noreferrer">
          <h2 className="line-clamp-2 text-xl font-bold sm:text-3xl">
            {title}
          </h2>
        </a>
        <p className="line-clamp-2 text-sm text-muted-foreground">{headline}</p>
        <div className="flex items-center gap-2 text-sm">
          <span>{contentInfo}</span>
          <span>•</span>
          <span>{numLectures} lectures</span>
          <span>•</span>
          <span>{instructionalLevel}</span>
        </div>
        <div className="flex items-center gap-2">
          {rating && (
            <>
              <div className="relative">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <LuStar key={i} className="h-4 w-4 text-muted-foreground" />
                  ))}
                </div>
                <div
                  className="absolute left-0 top-0 flex overflow-hidden"
                  style={{ width: `${(parseFloat(rating) / 5) * 100}%` }}
                >
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <LuStar
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm font-medium">{rating}</span>
            </>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <LuUsers className="h-4 w-4" />
            <span>{numReviews}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <a
          href={udemyURL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button className="w-full hover:bg-yellow-600">
            View on <span className="text-[#a435f0]">&nbsp;Udemy</span>
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
