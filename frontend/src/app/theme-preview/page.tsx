import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import Pagination from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { kebab, type Role, type Scheme, type SchemeName } from "@/lib/palette";
import { getThemePalette } from "@/lib/services";

export const metadata: Metadata = {
  title: "Theme preview",
  robots: { index: false, follow: false },
};

// Draft Mode is per request (a cookie), so this page is never prerendered
export const dynamic = "force-dynamic";

const PANELS: { title: string; light: SchemeName; dark: SchemeName }[] = [
  { title: "Standard contrast", light: "light", dark: "dark" },
  {
    title: "High contrast (prefers-contrast: more)",
    light: "light-high-contrast",
    dark: "dark-high-contrast",
  },
];

// Every role once as a fill, with the role meant to sit on it
const keyColourSwatches = (key: "primary" | "secondary" | "tertiary"): [Role, Role][] => {
  const on = `on${key[0]!.toUpperCase()}${key.slice(1)}`;
  return [
    [key, on],
    [on, key],
    [`${key}Container`, `${on}Container`],
    [`${on}Container`, `${key}Container`],
    [`${key}Fixed`, `${on}Fixed`],
    [`${key}FixedDim`, `${on}FixedVariant`],
    [`${on}Fixed`, `${key}Fixed`],
    [`${on}FixedVariant`, `${key}FixedDim`],
  ] as [Role, Role][];
};

const SWATCH_GROUPS: { title: string; swatches: [Role, Role][] }[] = [
  { title: "Primary", swatches: keyColourSwatches("primary") },
  { title: "Secondary", swatches: keyColourSwatches("secondary") },
  { title: "Tertiary", swatches: keyColourSwatches("tertiary") },
  {
    title: "Error",
    swatches: [
      ["error", "onError"],
      ["onError", "error"],
      ["errorContainer", "onErrorContainer"],
      ["onErrorContainer", "errorContainer"],
    ],
  },
  {
    title: "Surface",
    swatches: [
      ["surfaceDim", "onSurface"],
      ["surface", "onSurface"],
      ["surfaceBright", "onSurface"],
      ["surfaceContainerLowest", "onSurface"],
      ["surfaceContainerLow", "onSurface"],
      ["surfaceContainer", "onSurface"],
      ["surfaceContainerHigh", "onSurface"],
      ["surfaceContainerHighest", "onSurface"],
      ["onSurface", "surface"],
      ["surfaceVariant", "onSurfaceVariant"],
      ["onSurfaceVariant", "surfaceVariant"],
    ],
  },
  {
    title: "Outline, inverse and utility",
    swatches: [
      ["outline", "surface"],
      ["outlineVariant", "onSurface"],
      ["inverseSurface", "inverseOnSurface"],
      ["inverseOnSurface", "inverseSurface"],
      ["inversePrimary", "inverseSurface"],
      ["surfaceTint", "onPrimary"],
      ["shadow", "inverseOnSurface"],
      ["scrim", "inverseOnSurface"],
    ],
  },
];

// The scheme's roles as --m3-* variables: the Tailwind colour classes inside the panel use them
const schemeStyle = (scheme: Scheme) =>
  Object.fromEntries(
    Object.entries(scheme).map(([role, value]) => [`--m3-${kebab(role)}`, value]),
  ) as CSSProperties;

function Swatches({ scheme }: { scheme: Scheme }) {
  return (
    <div className="flex flex-col gap-4">
      {SWATCH_GROUPS.map((group) => (
        <section key={group.title}>
          <h3 className="text-on-surface-variant type-label-medium mb-2 uppercase">
            {group.title}
          </h3>
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            {group.swatches.map(([fill, on]) => (
              <li
                key={fill}
                className="type-label-small rounded-md p-2"
                style={{ backgroundColor: scheme[fill], color: scheme[on] }}
              >
                <span className="block font-medium">{kebab(fill)}</span>
                <span className="font-mono">{scheme[fill]}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// Real site components, themed by the panel's variables
function ComponentSamples({ idPrefix }: { idPrefix: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Filled</Button>
        <Button variant="outline">Outlined</Button>
        <Button variant="ghost">Text</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Delete</Button>
        <Button disabled>Disabled</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge>Badge</Badge>
        <Badge variant="tertiary">Featured</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Error</Badge>
        <span className="bg-secondary-container text-on-secondary-container type-label-medium rounded-full px-3 py-1">
          Selected
        </span>
      </div>

      <Card className="h-auto">
        <CardHeader>
          <CardTitle>Card title</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>Secondary text on a card: dates, locations, excerpts.</CardDescription>
          <p>Body text on surface-container-low.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline">
            Read more
          </Button>
        </CardFooter>
      </Card>

      <form className="flex flex-col gap-2" aria-label="Sample form">
        <Label htmlFor={`${idPrefix}-name`}>Name</Label>
        <Input id={`${idPrefix}-name`} placeholder="Placeholder" />
        <Textarea placeholder="Message" rows={2} />
        <p className="text-error type-body-medium">Error message</p>
      </form>

      <Pagination route="BLOG" totalPages={5} currentPage={2} />

      <article className="prose prose-sm">
        <h2>Article heading</h2>
        <p>
          Body copy with a <Link href="/blog">link</Link>, <strong>bold text</strong> and{" "}
          <code>inline code</code>.
        </p>
        <blockquote>A quotation from the article.</blockquote>
        <ul>
          <li>List item</li>
          <li>Another list item</li>
        </ul>
        <pre>
          <code>const palette = await getThemePalette();</code>
        </pre>
      </article>
    </div>
  );
}

/**
 * The draft theme for editors (Strapi Preview → /api/preview → here): every role and the site's
 * components, light and dark side by side. Only in Draft Mode; the rest of the site also shows the
 * draft palette meanwhile, for this browser only.
 */
export default async function ThemePreviewPage() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) notFound();

  const palette = await getThemePalette();
  const { source, options } = palette;

  return (
    <main className="container flex flex-col gap-8 py-12">
      <header className="flex flex-col items-start gap-4">
        <div>
          <h1 className="type-headline-medium">Theme preview</h1>
          <p className="text-on-surface-variant type-body-medium mt-1">
            Draft palette · seed <span className="font-mono">{source.seed}</span> ·{" "}
            {options.variant.replace("_", " ")} · from {source.type}. Publish the theme in Strapi to
            make it live.
          </p>
        </div>
        <form action="/api/preview/disable" method="post">
          <Button type="submit" variant="outline" size="sm">
            Exit preview
          </Button>
        </form>
      </header>

      {PANELS.map((panel) => (
        <section key={panel.title} className="flex flex-col gap-3">
          <h2 className="type-title-large">{panel.title}</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {[panel.light, panel.dark].map((name) => (
              <div
                key={name}
                className="bg-surface text-on-surface border-outline-variant flex flex-col gap-6 rounded-lg border p-4"
                style={schemeStyle(palette.schemes[name])}
              >
                <h3 className="type-body-medium font-mono">{name}</h3>
                <Swatches scheme={palette.schemes[name]} />
                <ComponentSamples idPrefix={name} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
