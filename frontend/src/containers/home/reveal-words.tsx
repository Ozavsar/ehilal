import { Fragment } from "react";
import { cn } from "@/lib/utils";

interface RevealWordsProps {
  text: string;
  /** When the first word starts, in ms */
  delay?: number;
  /** Time between two words, in ms */
  step?: number;
  /** Classes for every word, e.g. how far they rise ([--hero-rise:0.4em]) */
  wordClassName?: string;
}

const WAVING_HAND = /^\u{1F44B}/u;

/**
 * Word-by-word entrance for the home hero, CSS only. Screen readers get the sr-only copy: some
 * read every inline-block word as a separate item.
 */
export function RevealWords({ text, delay = 0, step = 20, wordClassName }: RevealWordsProps) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => {
          const start = delay + index * step;
          return (
            <Fragment key={index}>
              {index > 0 && " "}
              <span
                className={cn("animate-hero-rise inline-block", wordClassName)}
                style={{ animationDelay: `${start}ms` }}
              >
                {WAVING_HAND.test(word) ? (
                  <span
                    className="animate-hero-wave inline-block origin-[70%_70%]"
                    style={{ animationDelay: `${start + 500}ms` }}
                  >
                    {word}
                  </span>
                ) : (
                  word
                )}
              </span>
            </Fragment>
          );
        })}
      </span>
    </>
  );
}
