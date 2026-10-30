import Image from "next/image";
import type { IGalleryImage } from "@/components/full-screen-gallery";
import { Icon } from "@/components/icon";
import { ArticleMorph, articleReveal } from "@/components/view-transitions";
import { detectLanguage } from "@/lib/language";
import type { IBlog, IMediumParagraph } from "@/types";
import ArticleLayout from "./article-layout";
import ArticleTopBar, { ARTICLE_TITLE_ID } from "./article-top-bar";
import { ImageGalleryProvider, ZoomButton, ZoomableImage } from "./image-gallery";
import { buildHeadingTree, getHeadings } from "./table-of-contents/heading-tree";

const MEDIUM_IMAGE_URL = "https://miro.medium.com/v2";
// Inline article images are requested at this width (Medium never upscales)
const INLINE_IMAGE_WIDTH = 700;
const HEADING_TYPE = /^H[1-6]$/;
const WORDS_PER_MINUTE = 230;
// The cover fills the text column: 70ch (744px) beside the TOC, the window minus the rail and
// margins below that
const COVER_IMAGE_SIZES = "(min-width: 600px) min(744px, calc(100vw - 144px)), calc(100vw - 32px)";

// Pixel size of the resized inline image, from the source size Medium reports (when it does)
function getInlineImageSize(metadata: IMediumParagraph["metadata"]) {
  const { originalWidth, originalHeight } = metadata ?? {};
  if (!originalWidth || !originalHeight) return {};
  const width = Math.min(originalWidth, INLINE_IMAGE_WIDTH);
  return { width, height: Math.round((originalHeight * width) / originalWidth) };
}

// Medium embeds GIFs through embedly: ...?src=https%3A%2F%2Fgiphy.com%2Fembed%2F<id>%2Ftwitter%2Fiframe
// Google's document viewer (drive.google.com/viewerng/viewer, docs.google.com/viewer?url=…) can't be
// framed reliably: with third-party cookies blocked or "download PDFs" on, the browser downloads a file
// called "viewer" instead. Such embeds become a link to the document itself.
function getViewerDocument(iframeSrc: string) {
  let url: URL;
  try {
    url = new URL(iframeSrc);
  } catch {
    return null;
  }
  const isViewer =
    /^(drive|docs)\.google\.com$/.test(url.hostname) &&
    /\/(viewerng\/viewer|viewer|gview)$/.test(url.pathname);
  const target = isViewer ? url.searchParams.get("url") : null;
  if (!target || !/^https?:\/\//i.test(target)) return null;
  let name = target.split(/[?#]/)[0]?.split("/").pop() ?? "";
  try {
    name = decodeURIComponent(name);
  } catch {
    // keep the raw segment
  }
  // Webflow-style CDN names start with a 24-character id ("64c0…e6_Whitepaper - T-REX.pdf")
  name = name.replace(/^[0-9a-f]{24}_/i, "");
  return { href: target, name: name || "Document" };
}

function getGiphyId(iframeSrc: string) {
  return iframeSrc.match(/giphy\.com(?:\/|%2F)embed(?:\/|%2F)([A-Za-z0-9]+)/i)?.[1] ?? null;
}

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();

// Medium stores the title, and the subtitle when there is one, as the first heading paragraphs.
// They move into the article header, so they aren't repeated in the body or listed in the TOC.
// A long post title comes back cut with "…", so the paragraph only has to start with it.
function splitHeader(paragraphs: IMediumParagraph[], title: string, subtitle: string) {
  const [first, second] = paragraphs;
  const isHeading = (p: IMediumParagraph | undefined): p is IMediumParagraph =>
    !!p && HEADING_TYPE.test(p.type);
  const shortTitle = normalize(title).replace(/…$/, "");

  if (!isHeading(first) || !shortTitle || !normalize(first.text).startsWith(shortTitle)) {
    return { title, subtitle: null, body: paragraphs };
  }
  if (isHeading(second) && subtitle && normalize(second.text) === normalize(subtitle)) {
    return { title: first.text, subtitle: second.text, body: paragraphs.slice(2) };
  }
  return { title: first.text, subtitle: null, body: paragraphs.slice(1) };
}

// The preview image (the blog card thumbnail) is the article cover. Medium usually repeats it as
// the first body image; that one then moves into the cover instead of showing twice.
function splitCover(body: IMediumParagraph[], previewImage: IBlog["previewImage"]) {
  if (!previewImage) return { cover: null, body };
  const leadIndex = body.findIndex((p) => p.type === "IMG");
  const lead = leadIndex !== -1 && leadIndex < 2 ? body[leadIndex] : undefined;
  if (lead?.metadata?.id !== previewImage.id) {
    return { cover: { id: previewImage.id, alt: previewImage.alt ?? "" }, body };
  }
  return {
    cover: { id: previewImage.id, alt: previewImage.alt || lead.text },
    body: body.filter((p) => p !== lead),
  };
}

function getReadingMinutes(paragraphs: IMediumParagraph[]) {
  const words = paragraphs.reduce((sum, p) => sum + (p.text.match(/\S+/g)?.length ?? 0), 0);
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

// Consecutive list item paragraphs become one <ul>/<ol>; everything else stays a single block
type Block =
  | { kind: "paragraph"; paragraph: IMediumParagraph; index: number }
  | { kind: "list"; ordered: boolean; items: IMediumParagraph[] };

function toBlocks(paragraphs: IMediumParagraph[]): Block[] {
  const blocks: Block[] = [];
  paragraphs.forEach((paragraph, index) => {
    const ordered = paragraph.type === "OLI";
    if (paragraph.type !== "ULI" && !ordered) {
      blocks.push({ kind: "paragraph", paragraph, index });
      return;
    }
    const last = blocks.at(-1);
    if (last?.kind === "list" && last.ordered === ordered) last.items.push(paragraph);
    else blocks.push({ kind: "list", ordered, items: [paragraph] });
  });
  return blocks;
}

interface MediumRendererProps {
  postId: string;
  title: string;
  subtitle: string;
  previewImage: IBlog["previewImage"];
  paragraphs: IMediumParagraph[];
}

// Server-rendered article body; only the TOC and the image zoom are client components
export default function MediumRenderer({
  postId,
  title,
  subtitle,
  previewImage,
  paragraphs,
}: MediumRendererProps) {
  const header = splitHeader(paragraphs, title, subtitle);
  const { cover, body } = splitCover(header.body, previewImage);
  const headings = getHeadings(body);
  const headingIds = new Map(headings.map((heading) => [heading.name, heading.id]));
  // The site is English, many articles are Turkish: their text gets lang="tr" for screen readers
  const lang = detectLanguage(
    [header.title, header.subtitle ?? "", ...body.map((p) => p.text)].join(" "),
  );
  // Medium's body headings are H3/H4: the outline continues from the <h1> title at h2
  const headingShift = headings.length ? Math.min(...headings.map((h) => h.level)) - 2 : 0;
  // IMG paragraph text is the caption Medium shows under the image. The cover opens the gallery.
  const images: IGalleryImage[] = [
    ...(cover
      ? [{ id: "cover", src: `${MEDIUM_IMAGE_URL}/resize:fit:1400/${cover.id}`, alt: cover.alt }]
      : []),
    ...body.flatMap((p) =>
      p.type === "IMG" && p.metadata?.id
        ? [{ id: p.name, src: `${MEDIUM_IMAGE_URL}/resize:fit:1400/${p.metadata.id}`, alt: p.text }]
        : [],
    ),
  ];

  const renderParagraph = (p: IMediumParagraph, paragraphIndex: number) => {
    switch (p.type) {
      case "H1":
      case "H2":
      case "H3":
      case "H4":
      case "H5":
      case "H6": {
        const level = Math.min(Math.max(Number(p.type[1]) - headingShift, 2), 6);
        const Heading = `h${level}` as "h2" | "h3" | "h4" | "h5" | "h6";
        return (
          // Clear of the fixed title bar on compact screens when a TOC link scrolls here.
          // Focusable from script only: a TOC link moves focus here (no ring, it isn't a control).
          <Heading
            key={p.name}
            id={headingIds.get(p.name)}
            tabIndex={-1}
            className="scroll-mt-20 outline-none"
          >
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
            src={`${MEDIUM_IMAGE_URL}/resize:fit:${INLINE_IMAGE_WIDTH}/${p.metadata.id}`}
            alt={p.text}
            {...getInlineImageSize(p.metadata)}
            // Without a cover, Medium articles usually open with an image right under the title
            lead={!cover && index === 0 && paragraphIndex < 2}
            // The caption names the image; fall back to its position when there is none
            label={
              p.text ? `Enlarge image: ${p.text}` : `Enlarge image ${index + 1} of ${images.length}`
            }
          />
        );
      }
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
        const { iframeSrc, title: frameTitle } = p.iframe.mediaResource;
        const giphyId = getGiphyId(iframeSrc);
        // Giphy's embed player scrolls inside the frame and shows other GIFs on hover
        const document = getViewerDocument(iframeSrc);
        if (document) {
          return (
            <a
              key={p.name}
              href={document.href}
              target="_blank"
              rel="noopener noreferrer"
              className="not-prose bg-surface-container-highest text-on-surface state-layer my-8 flex items-center gap-4 rounded-md p-4 no-underline"
            >
              <Icon name="picture_as_pdf" className="text-primary shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="type-title-medium block truncate">
                  {frameTitle || document.name}
                </span>
                <span className="type-body-small text-on-surface-variant block">
                  Opens the document in a new tab
                </span>
              </span>
              <Icon name="open_in_new" size={20} className="text-on-surface-variant shrink-0" />
            </a>
          );
        }
        if (giphyId) {
          return (
            // eslint-disable-next-line @next/next/no-img-element -- animated GIF straight from Giphy's CDN
            <img
              key={p.name}
              src={`https://media.giphy.com/media/${giphyId}/giphy.gif`}
              alt={frameTitle || ""}
              loading="lazy"
              className="mx-auto rounded-md"
            />
          );
        }
        return (
          <iframe
            key={p.name}
            src={iframeSrc}
            title={frameTitle ?? undefined}
            loading="lazy"
            className="bg-surface-container my-8 aspect-video w-full overflow-hidden rounded-md"
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <ImageGalleryProvider images={images} title="Article images">
      <ArticleTopBar title={header.title} lang={lang} />
      <ArticleLayout headingTree={buildHeadingTree(headings)} lang={lang}>
        <article className="w-full max-w-[70ch] min-w-0">
          <header className="mb-8 flex flex-col gap-3 sm:mb-12 sm:gap-4">
            {/* Cover and title continue the blog card's thumbnail and title (view transition) */}
            {cover && (
              <ArticleMorph postId={postId} part="cover">
                <ZoomButton
                  index={0}
                  label={cover.alt ? `Enlarge image: ${cover.alt}` : "Enlarge cover image"}
                  className="my-0 w-full rounded-xl"
                >
                  <Image
                    // The blog card thumbnail's source, so the morph lands on the same picture
                    src={`${MEDIUM_IMAGE_URL}/da:true/${cover.id}`}
                    alt={cover.alt}
                    // 16:9 like the card thumbnail it morphs from
                    width={1280}
                    height={720}
                    sizes={COVER_IMAGE_SIZES}
                    // The LCP element of the article page
                    loading="eager"
                    fetchPriority="high"
                    draggable={false}
                    className="ease-standard aspect-video w-full object-cover transition-transform duration-300 select-none group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none"
                  />
                </ZoomButton>
              </ArticleMorph>
            )}
            <ArticleMorph postId={postId} part="title">
              <h1
                id={ARTICLE_TITLE_ID}
                lang={lang}
                className="text-on-surface type-headline-medium lg:type-display-small text-balance"
              >
                {header.title}
              </h1>
            </ArticleMorph>
            {header.subtitle && (
              <p
                lang={lang}
                className="text-on-surface-variant type-title-medium sm:type-title-large"
                {...articleReveal(1)}
              >
                {header.subtitle}
              </p>
            )}
            <p className="text-on-surface-variant type-label-large" {...articleReveal(2)}>
              {getReadingMinutes(body)} min read
            </p>
          </header>
          <div lang={lang} className="prose max-w-none" {...articleReveal(3)}>
            {toBlocks(body).map((block) => {
              if (block.kind === "paragraph") {
                return renderParagraph(block.paragraph, block.index);
              }
              const List = block.ordered ? "ol" : "ul";
              return (
                <List key={block.items[0]?.name}>
                  {block.items.map((item) => (
                    <li key={item.name}>{item.text}</li>
                  ))}
                </List>
              );
            })}
          </div>
        </article>
      </ArticleLayout>
    </ImageGalleryProvider>
  );
}
