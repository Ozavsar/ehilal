import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Gallery from "./gallery";
import type { IStrapiConference } from "@/types";

export default function ConferenceCard({ title, date, location, images }: IStrapiConference) {
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-[5px]">
      <CardHeader className="border-primary bg-primary aspect-video h-fit overflow-hidden border-b-8 p-0">
        <Gallery images={images} title={title} />
      </CardHeader>
      <CardContent className="p-4 pb-2">
        <h2 className="text-lg font-bold">{title}</h2>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between gap-4 p-4 pt-1">
        <Badge variant="outline">{location}</Badge>
        <p className="shrink-0 text-xs max-sm:text-xs dark:text-gray-400">
          {new Date(date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </CardFooter>
    </Card>
  );
}
