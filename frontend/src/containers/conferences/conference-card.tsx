import { Icon } from "@/components/icon";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Gallery, { type IConferencePhoto } from "./gallery";
import type { IImage, IStrapiConference } from "@/types";

// Only what the gallery uses goes to the client (Strapi images carry every format's metadata)
const toPhoto = ({ id, url, blurDataURL, width, height, formats }: IImage): IConferencePhoto => ({
  id,
  url,
  blurDataURL,
  width,
  height,
  large: formats?.large && {
    url: formats.large.url,
    width: formats.large.width,
    height: formats.large.height,
  },
});

// `date` is a calendar date (YYYY-MM-DD), parsed as UTC midnight: format it in UTC as well
const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(date: string) {
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? null : DATE_FORMAT.format(parsed);
}

export default function ConferenceCard({
  id,
  title,
  date,
  location,
  images,
  priority = false,
}: IStrapiConference & { priority?: boolean }) {
  const formattedDate = formatDate(date);

  return (
    <Card interactive className="h-full gap-0 p-0">
      <CardHeader className="aspect-video overflow-hidden p-0">
        <Gallery conferenceId={id} photos={images.map(toPhoto)} title={title} priority={priority} />
      </CardHeader>
      <CardContent className="flex flex-col gap-2 p-4 pb-0">
        {formattedDate && (
          <time dateTime={date} className="type-label-medium text-on-surface-variant">
            {formattedDate}
          </time>
        )}
        <h2 className="type-title-large">{title}</h2>
      </CardContent>
      <CardFooter className="mt-auto flex items-center p-4">
        {/* A long venue truncates instead of wrapping the chip onto two lines */}
        <Badge variant="outline" className="max-w-full min-w-0 gap-1" title={location}>
          <Icon name="location_on" />
          <span className="truncate">{location}</span>
        </Badge>
      </CardFooter>
    </Card>
  );
}
