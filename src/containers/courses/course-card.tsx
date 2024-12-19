import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { ICourse } from "@/types.d";
import { Button } from "@/components/ui/button";
import { Star, Users } from "lucide-react";

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
    <Card className="row-span-3 grid grid-rows-subgrid gap-0 overflow-hidden rounded-[5px] border border-muted bg-muted">
      <CardHeader className="overflow-hidden border-b-8 border-primary bg-primary p-0">
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
      <CardContent className="row-span-1 flex flex-col gap-2 p-4 pb-2">
        <a href={udemyURL} target="_blank" rel="noopener noreferrer">
          <h2 className="line-clamp-2 text-xl font-bold">{title}</h2>
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
                    <Star key={i} className="h-4 w-4 fill-muted text-muted" />
                  ))}
                </div>
                <div
                  className="absolute left-0 top-0 flex overflow-hidden"
                  style={{ width: `${(parseFloat(rating) / 5) * 100}%` }}
                >
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
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
            <Users className="h-4 w-4" />
            <span>{numReviews}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="row-span-1 flex justify-between p-4 pt-1">
        <a href={udemyURL} target="_blank" rel="noopener noreferrer">
          <Button variant={"link"} className="h-fit p-0 text-foreground">
            View on <span className="text-[#a435f0]">&nbsp;Udemy</span>
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
