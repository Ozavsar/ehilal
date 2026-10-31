import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { SITE_URL } from "@/config/site";
import { getMediumPostIdFromUrl } from "@/lib/services/medium";
import type { IMediumMarkup } from "@/types";

// A page of this site or another site (new tab); null for schemes that shouldn't be links
// (javascript: and the like)
export type ResolvedLink = { href: string; internal: boolean } | null;

export interface InlineLinkOptions {
  /** Medium post id → this site's /blog/<slug> path, for the posts it republishes */
  postPaths: ReadonlyMap<string, string>;
  /** The article's own post id and its heading ids by Medium paragraph name, for in-page links */
  postId: string;
  headingIds: ReadonlyMap<string, string>;
  /** Screen reader suffix of links that open a new tab, in the article's language */
  opensInNewTab: string;
}

const SITE_ORIGIN = new URL(SITE_URL).origin;

/** Links to the site owner's Medium posts that the site republishes go to their page here */
export function resolveLink(href: string, options: InlineLinkOptions): ResolvedLink {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol === "mailto:" || url.protocol === "tel:") return { href, internal: false };
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const postId = getMediumPostIdFromUrl(url);
  if (postId === options.postId) {
    // Medium section links end in #<paragraph name>
    const headingId = options.headingIds.get(url.hash.slice(1));
    if (headingId) return { href: `#${headingId}`, internal: true };
  }
  const path = postId ? options.postPaths.get(postId) : undefined;
  if (path) return { href: path, internal: true };
  if (url.origin === SITE_ORIGIN)
    return { href: url.pathname + url.search + url.hash, internal: true };
  return { href: url.href, internal: false };
}

/** Same tab within the site (not prefetched: an article can link a lot), a new tab elsewhere */
export function ArticleLink({
  link,
  options,
  className,
  children,
}: {
  link: NonNullable<ResolvedLink>;
  options: InlineLinkOptions;
  className?: string;
  children: ReactNode;
}) {
  if (link.internal) {
    return (
      <Link href={link.href} prefetch={false} className={className}>
        {children}
      </Link>
    );
  }
  const newTab = /^https?:/.test(link.href);
  return (
    <a
      href={link.href}
      className={className}
      {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
    >
      {children}
      {newTab && <span className="sr-only"> {options.opensInNewTab}</span>}
    </a>
  );
}

// Markups the renderer turns into elements; on equal ranges a link wraps the formatting
const MARKUP_ORDER: Record<string, number> = { A: 0, STRONG: 1, EM: 2, CODE: 3 };

interface MarkupNode {
  markup: IMediumMarkup | null;
  children: (MarkupNode | string)[];
}

type Range = IMediumMarkup;

const contains = (a: Range, b: Range) => a.start <= b.start && a.end >= b.end;

// A range wraps the ranges it contains. Of two partly overlapping ranges a link stays whole and the
// formatting is split around it (two links would mean two tab stops), else the earlier one wraps.
function outerFirst(a: Range, b: Range) {
  const aWraps = contains(a, b);
  if (aWraps !== contains(b, a)) return aWraps ? -1 : 1;
  return (MARKUP_ORDER[a.type] ?? 0) - (MARKUP_ORDER[b.type] ?? 0) || a.start - b.start;
}

// Medium ranges may nest or overlap: the text is cut at every range boundary and each piece is
// wrapped in the ranges that cover it, so the result is always properly nested
function buildMarkupTree(text: string, markups: IMediumMarkup[]): MarkupNode {
  const seen = new Set<string>();
  const ranges = markups
    .filter((m) => m.type in MARKUP_ORDER)
    .map((m) => ({ ...m, start: Math.max(0, m.start), end: Math.min(text.length, m.end) }))
    .filter((m) => {
      const key = `${m.type}:${m.start}:${m.end}:${m.href}`;
      if (m.start >= m.end || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const bounds = [...new Set([0, text.length, ...ranges.flatMap((m) => [m.start, m.end])])].sort(
    (a, b) => a - b,
  );

  const root: MarkupNode = { markup: null, children: [] };
  const open: MarkupNode[] = [root];
  for (let i = 0; i + 1 < bounds.length; i++) {
    const from = bounds[i] ?? 0;
    const to = bounds[i + 1] ?? 0;
    const active = ranges.filter((m) => m.start <= from && m.end >= to).sort(outerFirst);
    let depth = 0;
    while (depth < active.length && open[depth + 1]?.markup === active[depth]) depth++;
    open.length = depth + 1;
    for (const markup of active.slice(depth)) {
      const node: MarkupNode = { markup, children: [] };
      open.at(-1)?.children.push(node);
      open.push(node);
    }
    open.at(-1)?.children.push(text.slice(from, to));
  }
  return root;
}

interface RenderOptions extends InlineLinkOptions {
  /** Medium's soft line breaks (\n) become <br>; off in code blocks, which keep their whitespace */
  breaks: boolean;
  /** Inline code; off in code blocks */
  code: boolean;
}

function renderText(text: string, breaks: boolean): ReactNode {
  if (!breaks || !text.includes("\n")) return text;
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {line}
    </Fragment>
  ));
}

function renderNode(node: MarkupNode, options: RenderOptions, inLink: boolean): ReactNode {
  const isLink = node.markup?.type === "A";
  const children = node.children.map((child, index) => (
    <Fragment key={index}>
      {typeof child === "string"
        ? renderText(child, options.breaks)
        : renderNode(child, options, inLink || isLink)}
    </Fragment>
  ));

  switch (node.markup?.type) {
    case "STRONG":
      return <strong>{children}</strong>;
    case "EM":
      return <em>{children}</em>;
    case "CODE":
      // A tonal chip like Medium's, without the typography plugin's backticks
      return options.code ? (
        <code className="bg-surface-container-high rounded-xs px-1 py-0.5 before:content-none after:content-none">
          {children}
        </code>
      ) : (
        children
      );
    case "A": {
      const { href, anchorType, userId } = node.markup;
      // A mention of a Medium user links to their profile
      const target =
        href ?? (anchorType === "USER" && userId ? `https://medium.com/u/${userId}` : null);
      const link = target ? resolveLink(target, options) : null;
      // Overlapping links can't nest: the inner one stays plain text
      if (!link || inLink) return children;
      return (
        <ArticleLink link={link} options={options}>
          {children}
        </ArticleLink>
      );
    }
    default:
      return children;
  }
}

/** A Medium paragraph's text with its links, bold, italic and inline code */
export function InlineText({
  text,
  markups,
  options,
  breaks = true,
  code = true,
}: {
  text: string;
  markups: IMediumMarkup[];
  options: InlineLinkOptions;
  breaks?: boolean;
  code?: boolean;
}) {
  if (markups.length === 0) return renderText(text, breaks);
  return renderNode(buildMarkupTree(text, markups), { ...options, breaks, code }, false);
}
