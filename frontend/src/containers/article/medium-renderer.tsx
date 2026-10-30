import type { IGalleryImage } from "@/components/full-screen-gallery";
import type { IMediumParagraph } from "@/types";
import ArticleLayout from "./article-layout";
import { ImageGalleryProvider, ZoomableImage } from "./image-gallery";
import { buildHeadingTree, getHeadings } from "./table-of-contents/heading-tree";

const MEDIUM_IMAGE_URL = "https://miro.medium.com/v2";

// Medium embeds GIFs through embedly: ...?src=https%3A%2F%2Fgiphy.com%2Fembed%2F<id>%2Ftwitter%2Fiframe
function getGiphyId(iframeSrc: string) {
  return iframeSrc.match(/giphy\.com(?:\/|%2F)embed(?:\/|%2F)([A-Za-z0-9]+)/i)?.[1] ?? null;
}

// Server-rendered article body; only the TOC and the image zoom are client components
export default function MediumRenderer({ paragraphs }: { paragraphs: IMediumParagraph[] }) {
  const headings = getHeadings(paragraphs);
  const headingIds = new Map(headings.map((heading) => [heading.name, heading.id]));
  // IMG paragraph text is the caption Medium shows under the image
  const images: IGalleryImage[] = paragraphs.flatMap((p) =>
    p.type === "IMG" && p.metadata?.id
      ? [{ id: p.name, src: `${MEDIUM_IMAGE_URL}/resize:fit:1400/${p.metadata.id}`, alt: p.text }]
      : [],
  );

  return (
    <ImageGalleryProvider images={images} title="Article images">
      <ArticleLayout headingTree={buildHeadingTree(headings)}>
        <article className="prose-sm dark:prose-invert sm:prose md:prose-lg *:scroll-mt-bar-offset max-w-xs flex-1 snap-y snap-mandatory scroll-smooth *:snap-start *:2xl:scroll-mt-8">
          {paragraphs.map((p) => {
            switch (p.type) {
              case "H1":
              case "H2":
              case "H3":
              case "H4":
              case "H5":
              case "H6": {
                const Heading = p.type.toLowerCase() as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
                return (
                  <Heading key={p.name} id={headingIds.get(p.name)}>
                    {p.text}
                  </Heading>
                );
              }
              case "P":
                return <p key={p.name}>{p.text}</p>;
              case "IMG": {
                const index = images.findIndex((image) => image.id === p.name);
                if (index === -1 || !p.metadata) return null;
                return (
                  <ZoomableImage
                    key={p.name}
                    index={index}
                    src={`${MEDIUM_IMAGE_URL}/resize:fit:700/${p.metadata.id}`}
                    alt={p.text}
                    // The caption names the image; fall back to its position when there is none
                    label={
                      p.text
                        ? `Enlarge image: ${p.text}`
                        : `Enlarge image ${index + 1} of ${images.length}`
                    }
                  />
                );
              }
              case "ULI":
                return <li key={p.name}>{p.text}</li>;
              case "PRE":
                return (
                  <pre key={p.name} className="text-wrap">
                    {p.text}
                  </pre>
                );
              case "BQ":
              case "PQ":
                return <blockquote key={p.name}>{p.text}</blockquote>;
              case "IFRAME": {
                if (!p.iframe) return null;
                const { iframeSrc, title } = p.iframe.mediaResource;
                const giphyId = getGiphyId(iframeSrc);
                // Giphy's embed player scrolls inside the frame and shows other GIFs on hover
                if (giphyId) {
                  return (
                    // eslint-disable-next-line @next/next/no-img-element -- animated GIF straight from Giphy's CDN
                    <img
                      key={p.name}
                      src={`https://media.giphy.com/media/${giphyId}/giphy.gif`}
                      alt={title || ""}
                      loading="lazy"
                      className="mx-auto"
                    />
                  );
                }
                return (
                  <iframe
                    key={p.name}
                    src={iframeSrc}
                    title={title ?? undefined}
                    loading="lazy"
                    className="mx-auto aspect-video w-full overflow-hidden"
                  />
                );
              }
              default:
                return null;
            }
          })}
        </article>
      </ArticleLayout>
    </ImageGalleryProvider>
  );
}
