import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Gallery, { type IConferencePhoto } from "./gallery";
import type { IImage, IStrapiConference } from "@/types";

// Only what the gallery uses goes to the client (Strapi images carry every format's metadata)
const toPhoto = ({ id, url, blurDataURL, formats }: IImage): IConferencePhoto => ({
  id,
  url,
  blurDataURL,
  large: formats?.large && {
    url: formats.large.url,
    width: formats.large.width,
    height: formats.large.height,
  },
});

export default function ConferenceCard({
  title,
  date,
  location,
  images,
  priority = false,
}: IStrapiConference & { priority?: boolean }) {
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden">
      <CardHeader className="border-primary bg-primary aspect-video h-fit overflow-hidden border-b-8 p-0">
        <Gallery photos={images.map(toPhoto)} title={title} priority={priority} />
      </CardHeader>
      <CardContent className="p-4 pb-2">
        <h2 className="text-lg font-bold">{title}</h2>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between gap-4 p-4 pt-1">
        {/* A long venue truncates instead of wrapping the pill onto two lines */}
        <Badge variant="outline" className="min-w-0" title={location}>
          <span className="truncate">{location}</span>
        </Badge>
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
