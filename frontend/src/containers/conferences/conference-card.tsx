import Image, { StaticImageData } from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { truncateDescription } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Gallery from "./gallery";
import { IConference } from "@/types";

export default function ConferenceCard({
  timestamp,
  location,
  title,
  images,
}: IConference) {
  const date = new Date(timestamp * 1000).toLocaleDateString();
  return (
    <Card className="row-span-3 grid aspect-video grid-rows-subgrid gap-0 overflow-hidden rounded-[5px] border border-muted bg-muted">
      <CardHeader className="overflow-hidden border-b-8 border-primary bg-primary p-0">
        <Gallery images={images} title={title} />
      </CardHeader>
      <CardContent className="row-span-1 flex flex-col gap-2 p-4 pb-2">
        <h2 className="text-lg font-bold">{title}</h2>
      </CardContent>
      <CardFooter className="row-span-1 flex justify-between p-4 pt-1">
        <Badge variant="outline">{location}</Badge>
        <p className="text-sm dark:text-gray-400">{date}</p>
      </CardFooter>
    </Card>
  );
}
