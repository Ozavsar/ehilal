"use client";
import { useRef, useState } from "react";
import { LuZoomIn } from "react-icons/lu";
import { TOC, MobileTOC, useHeadingTree, useScrollSpy } from "./table-of-contents";
import FullScreenGallery, { type IGalleryImage } from "@/components/full-screen-gallery";
import { getCleanSlug, createSlugCounter } from "@/lib/utils";

const MEDIUM_IMAGE_URL = "https://miro.medium.com/v2";

// Medium embeds GIFs through embedly: ...?src=https%3A%2F%2Fgiphy.com%2Fembed%2F<id>%2Ftwitter%2Fiframe
function getGiphyId(iframeSrc: string) {
  return iframeSrc.match(/giphy\.com(?:\/|%2F)embed(?:\/|%2F)([A-Za-z0-9]+)/i)?.[1] ?? null;
}

export default function MediumRenderer({ paragraphs }: { paragraphs: any[] }) {
  const headingTree = useHeadingTree(paragraphs);
  const activeId = useScrollSpy();
  const tocRef = useRef<HTMLDivElement | null>(null);
  const slugCounter = createSlugCounter();
  // Index of the image opened in full screen, null when closed
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // Image that opened the gallery; focus returns to it on close
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  // IMG paragraph text is the caption Medium shows under the image
  const images: IGalleryImage[] = paragraphs
    .filter((p) => p.type === "IMG" && p.metadata?.id)
    .map((p) => ({
      id: p.name,
      src: `${MEDIUM_IMAGE_URL}/resize:fit:1400/${p.metadata.id}`,
      alt: p.text || "",
    }));
  return (
    <div className="relative mx-auto flex max-w-4xl justify-center">
      <aside
        ref={tocRef}
        className="scrollbar-thin scrollbar-thumb-primary fixed top-32 left-[calc(50%-42rem)] hidden h-[80vh] w-80 overflow-y-auto 2xl:block"
      >
        <h4 className="text-muted-foreground mb-2 font-semibold tracking-wide uppercase">
          Table of Contents
        </h4>
        <TOC tree={headingTree} activeId={activeId} containerRef={tocRef} />
      </aside>

      <article className="prose-sm dark:prose-invert sm:prose md:prose-lg max-w-xs flex-1 snap-y snap-mandatory scroll-smooth *:snap-start *:scroll-mt-24 *:2xl:scroll-mt-8">
        {paragraphs.map((p) => {
          const id =
            /^H[1-6]$/.test(p.type) && p.name ? getCleanSlug(p.text, slugCounter) : undefined;

          switch (p.type) {
            case "H1":
              return (
                <h1 key={p.name} id={id}>
                  {p.text}
                </h1>
              );
            case "H2":
              return (
                <h2 key={p.name} id={id}>
                  {p.text}
                </h2>
              );
            case "H3":
              return (
                <h3 key={p.name} id={id}>
                  {p.text}
                </h3>
              );
            case "H4":
              return (
                <h4 key={p.name} id={id}>
                  {p.text}
                </h4>
              );
            case "H5":
              return (
                <h5 key={p.name} id={id}>
                  {p.text}
                </h5>
              );
            case "H6":
              return (
                <h6 key={p.name} id={id}>
                  {p.text}
                </h6>
              );

            case "P":
              return <p key={p.name}>{p.text}</p>;
            case "IMG": {
              const index = images.findIndex((image) => image.id === p.name);
              if (index === -1) return null;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={(event) => {
                    triggerRef.current = event.currentTarget;
                    setOpenIndex(index);
                  }}
                  aria-label={`Enlarge image ${index + 1} of ${images.length}`}
                  className="not-prose group relative mx-auto my-[2em] block cursor-zoom-in overflow-hidden focus-visible:outline-none"
                >
                  <img
                    src={`${MEDIUM_IMAGE_URL}/resize:fit:700/${p.metadata.id}`}
                    alt={p.text || ""}
                    className="transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105"
                  />
                  {/* Hover cue and keyboard focus indicator, same as the card thumbnails */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    <span className="bg-primary flex size-12 items-center justify-center rounded-full text-white shadow-md">
                      <LuZoomIn size={22} />
                    </span>
                  </span>
                </button>
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
              const { iframeSrc, title } = p.iframe.mediaResource;
              const giphyId = getGiphyId(iframeSrc);
              // Giphy's embed player scrolls inside the frame and shows other GIFs on hover
              if (giphyId) {
                return (
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
                  title={title}
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
      <MobileTOC tree={headingTree} activeId={activeId} containerRef={tocRef} />
      {openIndex !== null && (
        <FullScreenGallery
          images={images}
          title="Article images"
          initialIndex={openIndex}
          returnFocusRef={triggerRef}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </div>
  );
}
