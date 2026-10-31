"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { schemesToCss } from "@/lib/palette-css";
import { cn } from "@/lib/utils";
import type { ThemeVariant } from "@/types";

// Editor-facing copy, in Turkish like the Strapi admin
const VARIANTS: { value: ThemeVariant; name: string }[] = [
  { value: "tonal_spot", name: "Tonal Spot" },
  { value: "vibrant", name: "Vibrant" },
  { value: "expressive", name: "Expressive" },
  { value: "fidelity", name: "Fidelity" },
  { value: "content", name: "Content" },
  { value: "neutral", name: "Neutral" },
  { value: "rainbow", name: "Rainbow" },
  { value: "fruit_salad", name: "Fruit Salad" },
  { value: "monochrome", name: "Monochrome" },
];

/** postMessage type the Strapi admin listens for (backend/src/admin/app.tsx) */
const THEME_CHOICE_MESSAGE = "ehilal:theme-choice";

const isVariant = (value: string): value is ThemeVariant =>
  VARIANTS.some((variant) => variant.value === value);

/** "#RRGGBB" or "RRGGBB" → "#rrggbb", otherwise null */
const toHex = (value: string) => {
  const hex = value.trim().replace(/^#?/, "#").toLowerCase();
  return /^#[0-9a-f]{6}$/.test(hex) ? hex : null;
};

const noSubscribe = () => () => {};

interface ThemePreviewBarProps {
  /** The draft theme's seed and variant: the starting point and what "Reset" goes back to */
  seed: string;
  variant: string;
  /** The draft theme's photo colours, when its source is a photo */
  candidates: string[];
  /** Strapi admin origins that may receive the chosen colour */
  parentOrigins: string[];
}

/**
 * Draft Mode toolbar: recolours the site live from a seed colour and variant (this browser only);
 * "Send to Strapi" hands the choice to the theme's edit view.
 */
export default function ThemePreviewBar({
  seed: draftSeed,
  variant: draftVariant,
  candidates,
  parentOrigins,
}: ThemePreviewBarProps) {
  const initialSeed = toHex(draftSeed) ?? "#000000";
  const initialVariant = isVariant(draftVariant) ? draftVariant : "tonal_spot";
  const [seed, setSeed] = useState(initialSeed);
  const [hexInput, setHexInput] = useState(initialSeed);
  const [variant, setVariant] = useState<ThemeVariant>(initialVariant);
  const [sentChoice, setSentChoice] = useState<string | null>(null);
  const publishedCss = useRef<string | null>(null);

  // Inside the Strapi admin's preview iframe the choice is posted to it, elsewhere it is copied
  const isFramed = useSyncExternalStore(
    noSubscribe,
    () => window.parent !== window,
    () => false,
  );

  const changed = seed !== initialSeed || variant !== initialVariant;
  const choice = `${seed} ${variant}`;

  // Rewrites the server-rendered palette (<style id="m3-palette"> in the root layout)
  useEffect(() => {
    const style = document.getElementById("m3-palette");
    if (!style) return;
    publishedCss.current ??= style.textContent;
    if (!changed) {
      style.textContent = publishedCss.current;
      return;
    }
    let cancelled = false;
    void import("@/lib/palette-generate").then(({ generateSchemes }) => {
      if (cancelled) return;
      const { light, dark } = generateSchemes(seed, variant);
      style.textContent = schemesToCss(light, dark);
    });
    return () => {
      cancelled = true;
    };
  }, [seed, variant, changed]);

  const pickSeed = (hex: string) => {
    setSeed(hex);
    setHexInput(hex);
  };

  const reset = () => {
    pickSeed(initialSeed);
    setVariant(initialVariant);
  };

  const send = () => {
    if (isFramed) {
      const message = { type: THEME_CHOICE_MESSAGE, seed, variant };
      // A target origin that isn't the parent's drops the message, so only the admin receives it
      for (const origin of parentOrigins) window.parent.postMessage(message, origin);
      setSentChoice(choice);
    } else {
      navigator.clipboard.writeText(seed).then(
        () => setSentChoice(choice),
        () => {},
      );
    }
  };

  const sent = sentChoice === choice;
  const controlClassName =
    "h-10 rounded-full bg-surface-container-highest px-4 text-on-surface type-label-large outline-primary focus-visible:outline-2";

  return (
    <div
      role="toolbar"
      aria-label="Tema önizleme"
      className={cn(
        "bg-surface-container-high text-on-surface shadow-elevation-3 fixed inset-x-2 top-2 z-(--z-floating)",
        "flex flex-wrap items-center justify-center gap-2 rounded-xl p-2",
        "sm:inset-x-auto sm:left-[calc(50%+var(--spacing-rail)/2)] sm:-translate-x-1/2 sm:flex-nowrap sm:rounded-full",
      )}
    >
      <span className="type-label-large text-on-surface-variant hidden px-2 whitespace-nowrap md:inline">
        Tema önizleme
      </span>

      <label
        className="border-outline relative size-10 shrink-0 cursor-pointer overflow-hidden rounded-full border"
        style={{ backgroundColor: seed }}
      >
        <span className="sr-only">Ana renk</span>
        <input
          type="color"
          value={seed}
          onChange={(event) => pickSeed(event.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
      <input
        type="text"
        aria-label="Ana renk (#RRGGBB)"
        value={hexInput}
        maxLength={7}
        spellCheck={false}
        onChange={(event) => {
          setHexInput(event.target.value);
          const hex = toHex(event.target.value);
          if (hex) setSeed(hex);
        }}
        className={cn(controlClassName, "w-28 tabular-nums")}
      />

      {candidates.length > 0 && (
        <div role="group" aria-label="Fotoğraftan çıkan renkler" className="flex gap-1">
          {candidates.map((hex) => (
            <button
              key={hex}
              type="button"
              aria-label={hex}
              aria-pressed={hex === seed}
              title={hex}
              onClick={() => pickSeed(hex)}
              className="border-outline aria-pressed:outline-primary size-6 rounded-full border aria-pressed:outline-2 aria-pressed:outline-offset-2"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      )}

      <select
        aria-label="Palet varyantı"
        value={variant}
        onChange={(event) => {
          if (isVariant(event.target.value)) setVariant(event.target.value);
        }}
        className={controlClassName}
      >
        {VARIANTS.map(({ value, name }) => (
          <option key={value} value={value}>
            {name}
          </option>
        ))}
      </select>

      {changed && (
        <Button type="button" variant="ghost" onClick={reset}>
          Sıfırla
        </Button>
      )}

      <Button type="button" onClick={send}>
        <Icon name={sent ? "check_circle" : "arrow_outward"} size={20} />
        {isFramed
          ? sent
            ? "Strapi'ye aktarıldı"
            : "Strapi'ye aktar"
          : sent
            ? "Kopyalandı"
            : "Rengi kopyala"}
      </Button>

      <form action="/api/preview/disable" method="post">
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Önizlemeden çık"
          title="Önizlemeden çık"
        >
          <Icon name="close" />
        </Button>
      </form>
    </div>
  );
}
