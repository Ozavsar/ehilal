// Language detection for content the sources don't label: Medium/Substack articles and YouTube
// videos are written in Turkish or English. Used for `lang` attributes, og:locale and JSON-LD
// inLanguage. Pure and synchronous, so client and server components can both call it.

export type ContentLanguage = "tr" | "en";

// Letters English text doesn't use. Ö and Ü also occur in German, which the site doesn't publish.
const TURKISH_LETTERS = /[çğıöşüÇĞİÖŞÜ]/g;

// Frequent function words that are not also English words
const TURKISH_WORDS = new Set([
  "ve",
  "bir",
  "bu",
  "için",
  "ile",
  "da",
  "de",
  "olarak",
  "gibi",
  "daha",
  "çok",
  "veya",
  "ya",
  "ama",
  "olan",
  "nedir",
  "nasıl",
  "her",
  "kadar",
  "sonra",
]);

const ENGLISH_WORDS = new Set([
  "the",
  "and",
  "of",
  "to",
  "in",
  "is",
  "for",
  "with",
  "on",
  "a",
  "an",
  "how",
  "what",
  "are",
  "at",
  "by",
  "from",
  "your",
  "this",
  "that",
]);

// The opening of an article decides as well as the whole body, at a fraction of the work
const MAX_SAMPLE_LENGTH = 4000;

/**
 * "tr" when the text reads as Turkish, otherwise "en" (the site language). A Turkish letter counts
 * once and a function word twice, so an English sentence with a Turkish name in it stays English.
 */
export function detectLanguage(text: string): ContentLanguage {
  const sample = text.slice(0, MAX_SAMPLE_LENGTH);
  const turkishLetters = sample.match(TURKISH_LETTERS)?.length ?? 0;

  let turkishWords = 0;
  let englishWords = 0;
  // Plain toLowerCase(): the Turkish locale would turn English "In"/"Is" into "ın"/"ıs"
  for (const word of sample.toLowerCase().split(/[^\p{L}]+/u)) {
    if (TURKISH_WORDS.has(word)) turkishWords++;
    else if (ENGLISH_WORDS.has(word)) englishWords++;
  }

  return turkishLetters + 2 * turkishWords > 2 * englishWords ? "tr" : "en";
}

/**
 * Language of a Medium article, from its title, subtitle and body. The article page's metadata and
 * its `lang` attribute both use this, so they always agree.
 */
export function detectArticleLanguage(article: {
  title: string;
  subtitle: string;
  paragraphs: { text: string }[];
}): ContentLanguage {
  let text = `${article.title}\n${article.subtitle}`;
  for (const paragraph of article.paragraphs) {
    if (text.length >= MAX_SAMPLE_LENGTH) break;
    text += `\n${paragraph.text}`;
  }
  return detectLanguage(text);
}

/** Open Graph locale (`og:locale`) for a content language */
export const OG_LOCALES: Record<ContentLanguage, string> = { tr: "tr_TR", en: "en_US" };
