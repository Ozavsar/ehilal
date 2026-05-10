import Image from "next/image";
import { LuStar, LuUsers } from "react-icons/lu";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ICourse } from "@/types.d";

export default function CourseCard({
  blurDataURL,
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
    <Card className="flex h-full flex-col">
      <CardHeader>
        <a href={udemyURL} target="_blank" rel="noopener noreferrer">
          <Image
            src={thumbnailURL || "/images/courses/default-course.jpg"}
            alt={title || ""}
            width={800}
            height={800}
            blurDataURL={blurDataURL ? blurDataURL : undefined}
            placeholder={blurDataURL ? "blur" : "empty"}
            className="aspect-video object-cover transition-transform duration-500 hover:scale-105"
          />
        </a>
      </CardHeader>
      <CardContent className="flex flex-1">
        <a href={udemyURL} target="_blank" rel="noopener noreferrer">
          <h2 className="text-foreground line-clamp-2 text-lg font-bold sm:text-2xl">{title}</h2>
        </a>
        <p className="text-muted-foreground line-clamp-2 text-sm">{headline}</p>
        <div className="mt-auto flex items-center gap-2 text-sm max-sm:my-1 max-sm:justify-around max-sm:text-xs">
          <span>{contentInfo}</span>
          <span>•</span>
          <span>{numLectures} lectures</span>
          <span>•</span>
          <span>{instructionalLevel}</span>
        </div>
        <div className="flex items-center gap-2 text-sm max-sm:my-1 max-sm:justify-between max-sm:text-xs">
          <div className="text-muted-foreground flex items-center gap-1">
            {rating && (
              <>
                <div className="relative">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <LuStar key={i} className="text-muted-foreground size-4" />
                    ))}
                  </div>
                  <div
                    className="absolute top-0 left-0 flex overflow-hidden"
                    style={{ width: `${(parseFloat(rating) / 5) * 100}%` }}
                  >
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <LuStar key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="font-medium">{rating}</span>
              </>
            )}
          </div>
          <div className="text-muted-foreground flex items-center gap-1">
            <LuUsers className="h-4 w-4" />
            <span>{numReviews}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="mt-2">
        <a href={udemyURL} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button className="hover:bg-primary/80 w-full">
            View on{" "}
            <span className="font-bold text-[#a435f0] mix-blend-difference">&nbsp;Udemy</span>
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
