import type { ReactNode } from "react";
import Image from "next/image";
import type { IGalleryImage } from "@/components/full-screen-gallery";
import { Icon } from "@/components/icon";
import { ArticleMorph, articleReveal } from "@/components/view-transitions";
import type { ArticleTranslation } from "@/config/translations";
import type { ContentLanguage } from "@/lib/language";
import type { IBlog, IMediumParagraph } from "@/types";
import AnimatedImage from "./animated-image";
import { ArticleLinkCard } from "./article-end";
import ArticleLayout from "./article-layout";
import { ArticleByline, ArticleOrigin, LockedNotice, TranslationChip } from "./article-meta";
import ArticleTopBar, { ARTICLE_TITLE_ID } from "./article-top-bar";
import { ImageGalleryProvider, ZoomButton, ZoomableImage } from "./image-gallery";
import { ArticleLink, InlineText, resolveLink, type InlineLinkOptions } from "./inline-text";
import { ARTICLE_STRINGS } from "./strings";
import { buildHeadingTree, getHeadings } from "./table-of-contents/heading-tree";

const MEDIUM_IMAGE_URL = "https://miro.medium.com/v2";
const HEADING_TYPE = /^H[1-6]$/;
const WORDS_PER_MINUTE = 230;
// The text column: 70ch (744px) beside the TOC, the window minus the rail and margins below that
const COLUMN_WIDTH = 744;
const COVER_IMAGE_SIZES = "(min-width: 600px) min(744px, calc(100vw - 144px)), calc(100vw - 32px)";
// Body image widths requested from Medium: 1x/2x/3x phones, the column at 1x and 2x
const BODY_IMAGE_WIDTHS = [360, 744, 1080, 1488];
// Giphy's still frame and its animated WebP, a quarter of the GIF's weight
export const giphyUrl = (id: string, file: "480w_s.jpg" | "giphy.webp") =>
  `https://media.giphy.com/media/${id}/${file}`;

// Rendered pixel size of a body image: its source size (when Medium reports it), at most the column
function getBodyImageSize(metadata: IMediumParagraph["metadata"]) {
  const { originalWidth, originalHeight } = metadata ?? {};
  if (!originalWidth || !originalHeight) return {};
  const width = Math.min(originalWidth, COLUMN_WIDTH);
  return { width, height: Math.round((originalHeight * width) / originalWidth) };
}

// Medium resizes and converts on its CDN (it never upscales: widths stop at the source width).
// `prefix` "da:true/" asks for a still frame of an animated image.
function getBodyImageSources(metadata: NonNullable<IMediumParagraph["metadata"]>, prefix = "") {
  const { id, originalWidth } = metadata;
  const widths = originalWidth
    ? [
        ...new Set([
          ...BODY_IMAGE_WIDTHS.filter((w) => w < originalWidth),
          Math.min(originalWidth, 1488),
        ]),
      ]
    : BODY_IMAGE_WIDTHS;
  const url = (width: number) =>
    `${MEDIUM_IMAGE_URL}/${prefix}resize:fit:${width}/format:webp/${id}`;
  const width = Math.min(originalWidth ?? COLUMN_WIDTH, COLUMN_WIDTH);
  return {
    src: url(width),
    srcSet: widths.map((w) => `${url(w)} ${w}w`).join(", "),
    // The column, or less for an image narrower than the column
    sizes:
      width < COLUMN_WIDTH
        ? `(min-width: 600px) min(${width}px, calc(100vw - 144px)), min(${width}px, calc(100vw - 32px))`
        : COVER_IMAGE_SIZES,
  };
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

export function getGiphyId(iframeSrc: string) {
  return iframeSrc.match(/giphy\.com(?:\/|%2F)embed(?:\/|%2F)([A-Za-z0-9]+)/i)?.[1] ?? null;
}

// A link preview card (Medium "mixtape" embed). Its text is "<title>\n<description><domain>": the
// title is the bold range, the description the italic one, the domain whatever follows them.
function getLinkPreview(p: IMediumParagraph) {
  const link = p.markups.find((m) => m.type === "A" && m.href);
  if (!link?.href) return null;
  const slice = (type: string) => {
    const markup = p.markups.find((m) => m.type === type);
    return markup ? { text: p.text.slice(markup.start, markup.end).trim(), end: markup.end } : null;
  };
  const title = slice("STRONG");
  const description = slice("EM");
  let domain = p.text.slice(Math.max(title?.end ?? 0, description?.end ?? 0)).trim();
  if (!title || !domain) {
    try {
      domain = new URL(link.href).hostname.replace(/^www\./, "");
    } catch {
      domain = "";
    }
  }
  return {
    href: link.href,
    title: title?.text || p.text.split("\n")[0]?.trim() || domain,
    description: description?.text ?? "",
    domain,
  };
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
// the first body image; that one then moves into the cover, with its caption, instead of showing twice.
function splitCover(body: IMediumParagraph[], previewImage: IBlog["previewImage"]) {
  if (!previewImage) return { cover: null, body };
  const leadIndex = body.findIndex((p) => p.type === "IMG");
  const lead = leadIndex !== -1 && leadIndex < 2 ? body[leadIndex] : undefined;
  if (lead?.metadata?.id !== previewImage.id) {
    return { cover: { id: previewImage.id, alt: previewImage.alt ?? "", caption: null }, body };
  }
  return {
    cover: {
      id: previewImage.id,
      alt: previewImage.alt || lead.metadata.alt || lead.text,
      caption: lead.text ? lead : null,
    },
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
  mediumUrl: string;
  isLocked: boolean;
  /** The article's language (lib/language.ts), as in the page metadata */
  language: ContentLanguage;
  author: string;
  publishedAt?: string;
  updatedAt?: string;
  translation: ArticleTranslation | null;
  /** Medium post id → /blog/<slug> of the posts the site republishes, for links in the text */
  postPaths: ReadonlyMap<string, string>;
  /** Image ids Medium can't resize or convert, animated GIFs (getUnconvertedMediumImages): they
   * start as a still frame (one in the CCIP guide is 22 MB) */
  animatedImages: ReadonlySet<string>;
  /** Embedded media taken down at the source (a GIF removed from Giphy): left out */
  removedMedia: ReadonlySet<string>;
  /** Below the article in its column: series navigation, related articles */
  after?: ReactNode;
}

// Server-rendered article body; only the TOC, the image zoom and the GIF player are client components
export default function MediumRenderer({
  postId,
  title,
  subtitle,
  previewImage,
  paragraphs,
  mediumUrl,
  isLocked,
  language,
  author,
  publishedAt,
  updatedAt,
  translation,
  postPaths,
  animatedImages,
  removedMedia,
  after,
}: MediumRendererProps) {
  const isAnimated = (imageId: string) => animatedImages.has(imageId);
  const strings = ARTICLE_STRINGS[language];
  const header = splitHeader(paragraphs, title, subtitle);
  const { cover, body } = splitCover(header.body, previewImage);
  const headings = getHeadings(body);
  const headingIds = new Map(headings.map((heading) => [heading.name, heading.id]));
  const linkOptions: InlineLinkOptions = {
    postPaths,
    postId,
    headingIds,
    opensInNewTab: strings.opensInNewTab,
  };
  const inline = (p: IMediumParagraph) => (
    <InlineText text={p.text} markups={p.markups} options={linkOptions} />
  );
  // Medium's body headings are H3/H4: the outline continues from the <h1> title at h2
  const headingShift = headings.length ? Math.min(...headings.map((h) => h.level)) - 2 : 0;
  // Image alt: the alt text entered on Medium, else the caption (IMG paragraph text). The cover and
  // the still images open the gallery; animated GIFs play in place instead.
  const images: IGalleryImage[] = [
    ...(cover
      ? [{ id: "cover", src: `${MEDIUM_IMAGE_URL}/resize:fit:1400/${cover.id}`, alt: cover.alt }]
      : []),
    ...body.flatMap((p) =>
      p.type === "IMG" && p.metadata?.id && !isAnimated(p.metadata.id)
        ? [
            {
              id: p.name,
              src: `${MEDIUM_IMAGE_URL}/resize:fit:1400/${p.metadata.id}`,
              alt: p.metadata.alt || p.text,
            },
          ]
        : [],
    ),
  ];

  // An image paragraph with a caption is a figure; the caption keeps its links and formatting
  const figure = (p: IMediumParagraph, media: ReactNode) =>
    p.text ? (
      <figure key={p.name}>
        {media}
        <figcaption className="text-center">{inline(p)}</figcaption>
      </figure>
    ) : (
      media
    );

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
            {inline(p)}
          </Heading>
        );
      }
      case "P":
        return <p key={p.name}>{inline(p)}</p>;
      case "IMG": {
        if (!p.metadata) return null;
        const alt = p.metadata.alt || p.text;
        // Inside a figure the figure has the margins
        const inFigure = p.text ? "my-0" : undefined;
        if (isAnimated(p.metadata.id)) {
          const poster = getBodyImageSources(p.metadata, "da:true/");
          return figure(
            p,
            <AnimatedImage
              key={p.name}
              poster={poster.src}
              posterSrcSet={poster.srcSet}
              sizes={poster.sizes}
              src={`${MEDIUM_IMAGE_URL}/resize:fit:${COLUMN_WIDTH}/${p.metadata.id}`}
              alt={alt}
              {...getBodyImageSize(p.metadata)}
              playLabel={strings.playAnimation}
              pauseLabel={strings.pauseAnimation}
              className={inFigure}
            />,
          );
        }
        const index = images.findIndex((image) => image.id === p.name);
        if (index === -1) return null;
        return figure(
          p,
          <ZoomableImage
            key={p.name}
            index={index}
            {...getBodyImageSources(p.metadata)}
            alt={alt}
            {...getBodyImageSize(p.metadata)}
            // Without a cover, Medium articles usually open with an image right under the title
            lead={!cover && index === 0 && paragraphIndex < 2}
            // The alt text or caption names the image; else its position
            label={
              alt ? strings.enlargeImage(alt) : strings.enlargeImageAt(index + 1, images.length)
            }
            className={inFigure}
          />,
        );
      }
      case "PRE":
        return (
          <pre key={p.name} className="text-wrap">
            <InlineText
              text={p.text}
              markups={p.markups}
              options={linkOptions}
              breaks={false}
              code={false}
            />
          </pre>
        );
      case "BQ":
      case "PQ":
        return <blockquote key={p.name}>{inline(p)}</blockquote>;
      case "MIXTAPE_EMBED": {
        const preview = getLinkPreview(p);
        const link = preview ? resolveLink(preview.href, linkOptions) : null;
        if (!preview || !link) return null;
        return (
          <ArticleLink
            key={p.name}
            link={link}
            options={linkOptions}
            className="not-prose bg-surface-container-highest text-on-surface state-layer my-8 flex items-center gap-4 rounded-md p-4 no-underline"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="type-title-medium line-clamp-2">{preview.title}</span>
              {preview.description && (
                <span className="type-body-small text-on-surface-variant line-clamp-2">
                  {preview.description}
                </span>
              )}
              {preview.domain && (
                <span className="type-label-medium text-on-surface-variant truncate">
                  {preview.domain}
                </span>
              )}
            </span>
            <Icon
              name={link.internal ? "arrow_forward" : "open_in_new"}
              size={20}
              className="text-on-surface-variant shrink-0"
            />
          </ArticleLink>
        );
      }
      case "IFRAME": {
        if (!p.iframe) return null;
        const { iframeSrc, title: frameTitle, iframeWidth, iframeHeight } = p.iframe.mediaResource;
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
                  {strings.openDocument}
                </span>
              </span>
              <Icon name="open_in_new" size={20} className="text-on-surface-variant shrink-0" />
            </a>
          );
        }
        if (giphyId && removedMedia.has(giphyUrl(giphyId, "480w_s.jpg"))) return null;
        if (giphyId) {
          return figure(
            p,
            <AnimatedImage
              key={p.name}
              poster={giphyUrl(giphyId, "480w_s.jpg")}
              src={giphyUrl(giphyId, "giphy.webp")}
              // "Starting Episode 4 GIF by PBS - Find & Share on GIPHY"
              alt={frameTitle?.replace(/\s+-\s+Find & Share on GIPHY$/i, "") ?? ""}
              {...(iframeWidth && iframeHeight ? { width: iframeWidth, height: iframeHeight } : {})}
              sizes={
                iframeWidth
                  ? `(min-width: 600px) min(${iframeWidth}px, calc(100vw - 144px)), min(${iframeWidth}px, calc(100vw - 32px))`
                  : undefined
              }
              playLabel={strings.playAnimation}
              pauseLabel={strings.pauseAnimation}
              className={p.text ? "my-0" : undefined}
            />,
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
      <ArticleTopBar title={header.title} lang={language} />
      <ArticleLayout headingTree={buildHeadingTree(headings)} lang={language}>
        {/* Everything in the column is in the article's language */}
        <div lang={language} className="w-full max-w-[70ch] min-w-0">
          <article>
            <header className="mb-8 flex flex-col gap-3 sm:mb-12 sm:gap-4">
              {/* Cover and title continue the blog card's thumbnail and title (view transition) */}
              {cover && (
                <figure className="my-0 flex flex-col gap-2">
                  <ArticleMorph postId={postId} part="cover">
                    <ZoomButton
                      index={0}
                      label={cover.alt ? strings.enlargeImage(cover.alt) : strings.enlargeCover}
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
                  {cover.caption && (
                    <figcaption
                      className="text-on-surface-variant type-body-small [&_a]:text-primary text-center [&_a]:underline"
                      {...articleReveal(1)}
                    >
                      {inline(cover.caption)}
                    </figcaption>
                  )}
                </figure>
              )}
              <ArticleMorph postId={postId} part="title">
                <h1
                  id={ARTICLE_TITLE_ID}
                  className="text-on-surface type-headline-medium lg:type-display-small text-balance"
                >
                  {header.title}
                </h1>
              </ArticleMorph>
              {header.subtitle && (
                <p
                  className="text-on-surface-variant type-title-medium sm:type-title-large"
                  {...articleReveal(1)}
                >
                  {header.subtitle}
                </p>
              )}
              <div className="flex flex-col items-start gap-3" {...articleReveal(2)}>
                <ArticleByline
                  author={author}
                  publishedAt={publishedAt}
                  updatedAt={updatedAt}
                  minutes={getReadingMinutes(body)}
                  language={language}
                />
                {translation && <TranslationChip translation={translation} />}
              </div>
            </header>
            <div className="prose max-w-none" {...articleReveal(3)}>
              {toBlocks(body).map((block) => {
                if (block.kind === "paragraph") {
                  return renderParagraph(block.paragraph, block.index);
                }
                const List = block.ordered ? "ol" : "ul";
                return (
                  <List key={block.items[0]?.name}>
                    {block.items.map((item) => (
                      <li key={item.name}>{inline(item)}</li>
                    ))}
                  </List>
                );
              })}
            </div>
            {isLocked && <LockedNotice mediumUrl={mediumUrl} language={language} />}
            <footer
              className="border-outline-variant mt-12 flex flex-col gap-6 border-t pt-6"
              {...articleReveal(3)}
            >
              <ArticleOrigin mediumUrl={mediumUrl} language={language} />
              {translation && (
                <ArticleLinkCard
                  label={ARTICLE_STRINGS[translation.language].readInThisLanguage}
                  title={translation.title}
                  href={translation.path}
                  icon="language"
                  hrefLang={translation.language}
                  lang={translation.language}
                />
              )}
            </footer>
          </article>
          {after}
        </div>
      </ArticleLayout>
    </ImageGalleryProvider>
  );
}
