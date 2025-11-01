"use client";
import { useRef } from "react";
import {
  TOC,
  MobileTOC,
  useHeadingTree,
  useScrollSpy,
} from "./table-of-contents";
import { getCleanSlug } from "@/lib/utils";

export default function MediumRenderer({ paragraphs }: { paragraphs: any[] }) {
  const headingTree = useHeadingTree(paragraphs);
  const activeId = useScrollSpy();
  const tocRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="relative mx-auto flex max-w-4xl justify-center">
      <aside
        ref={tocRef}
        className="scrollbar-thin scrollbar-thumb-primary fixed left-[calc(50%-42rem)] top-32 hidden h-[80vh] w-80 overflow-y-auto 2xl:block"
      >
        <h4 className="mb-2 font-semibold uppercase tracking-wide text-muted-foreground">
          Table of Contents
        </h4>
        <TOC tree={headingTree} activeId={activeId} containerRef={tocRef} />
      </aside>

      <article className="prose-sm dark:prose-invert sm:prose md:prose-lg max-w-xs flex-1 snap-y snap-mandatory scroll-smooth [&>*]:snap-start [&>*]:scroll-mt-24 [&>*]:2xl:scroll-mt-8">
        {paragraphs.map((p) => {
          const id =
            /^H[1-6]$/.test(p.type) && p.name
              ? `${getCleanSlug(p.text)}`
              : undefined;

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
            case "IMG":
              return (
                <img
                  key={p.name}
                  src={`https://miro.medium.com/v2/resize:fit:700/${p.metadata.id}`}
                  alt=""
                  className="mx-auto"
                />
              );
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
            case "IFRAME":
              return (
                <iframe
                  key={p.name}
                  src={p.iframe.mediaResource.iframeSrc}
                  title={p.iframe.mediaResource.title}
                  className="mx-auto aspect-video overflow-hidden"
                />
              );
            default:
              return null;
          }
        })}
      </article>
      <MobileTOC tree={headingTree} activeId={activeId} containerRef={tocRef} />
    </div>
  );
}
