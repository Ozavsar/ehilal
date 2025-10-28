import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Gallery from "./gallery";
import type { IStrapiConference } from "@/types.d";

export default function ConferenceCard({
  title,
  date,
  location,
  images,
}: IStrapiConference) {
  return (
    <Card className="row-span-3 grid aspect-video grid-rows-subgrid gap-0 overflow-hidden rounded-[5px] border border-muted bg-muted">
      <CardHeader className="overflow-hidden border-b-8 border-primary bg-primary p-0">
        <Gallery images={images} title={title} />
      </CardHeader>
      <CardContent className="row-span-1 flex flex-col gap-2 p-4 pb-2">
        <h2 className="text-lg font-bold">{title}</h2>
      </CardContent>
      <CardFooter className="row-span-1 flex items-center justify-between gap-4 p-4 pt-1">
        <Badge variant="outline">{location}</Badge>
        <p className="shrink-0 text-xs dark:text-gray-400 max-sm:text-xs">
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
