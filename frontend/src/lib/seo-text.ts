// Search-result text derived from Medium articles: titles without emoji that fit the 60 characters
// results show, and a description from the article itself when its Medium subtitle is a greeting,
// a disclaimer or a cut-off first sentence.

import { articleFallbackDescription } from "@/config/seo";
import type { ContentLanguage } from "@/lib/language";

// Search results cut titles at about 60 characters and descriptions at about 155
export const MAX_TITLE_LENGTH = 60;
const MIN_DESCRIPTION_LENGTH = 110;
const MAX_DESCRIPTION_LENGTH = 155;

// Emoji and other pictographs (☻ ♫ 📌 …), with their joiners and variation selectors
const SYMBOLS = /[\p{Extended_Pictographic}\p{So}\u{200D}\u{FE0F}\u{20E3}]/gu;

/** Text without emoji, with single spaces */
export const stripSymbols = (text: string) =>
  text.replace(SYMBOLS, " ").replace(/\s+/g, " ").trim();

/** Up to `max` characters, cut at a word boundary (no ellipsis), keeping a trailing "#n" part number */
function cutAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  // Series parts differ only in their number at the end: keep it, or their titles would be equal
  const part = text.match(/\s*#\s*\d+\s*$/)?.[0].trim();
  const room = part ? max - part.length - 1 : max;
  const cut = text.slice(0, room + 1);
  const head = (
    cut.lastIndexOf(" ") > room / 2 ? cut.slice(0, cut.lastIndexOf(" ")) : cut.slice(0, room)
  ).replace(/[\s,;:–—-]+$/, "");
  return part ? `${head} ${part}` : head;
}

/** An article title for <title>: no emoji, no trailing "…" (Medium's cut), at most 60 characters */
export const fitTitle = (title: string) =>
  cutAtWord(stripSymbols(title).replace(/\s*(…|\.{3})$/, ""), MAX_TITLE_LENGTH);

// A paragraph that says nothing about the article: a greeting, a disclaimer, a label ("Önemli
// Çıkarımlar:"), a bare link
// Stretched greetings too ("Merhabaaa", "Selllaaam")
const GREETING =
  /^(h+e+l+o+|h+i+|h+e+y+|dear|greetings|welcome|m+e+r+h+a+b+a+(l+a+r+)?|s+e+l+a+m+(l+a+r+)?|herkese merhaba|arkadaşlar merhaba|sevgili|değerli (arkadaşlarım|okuyucularım)|hoş geldiniz)\b[^.!?,\n]{0,45}[.!?,]+/iu;

// Sentences about the author or the post rather than its subject, as her openings go: "Ben Elif
// Hilal!", "thank you for reading my articles", "I have been planning to write this for a long
// time", disclaimers
const FILLER = [
  /\b(ben|benim adım|my name is|i am|i'm|i’m)\b.{0,20}\belif hilal\b|\bhilal ben\b/iu,
  /\bbir avukatım\b|\bi am a lawyer\b|senedir blockchain|been with blockchain|working on blockchain for years|senelerdir .*çalışıyorum/iu,
  /okuduğunuz (için|göre)|okuduğunuza göre|thank you for reading|thanks for reading/iu,
  /beni tanımayan|ismimi .*duyan|know me|heard my name|introduce myself|kendimi tanıt|hakkımda daha fazla/iu,
  /ilk (defa|kez) okuyorsanız|for the first time, welcome|welcome to my world|dünyama hoş ?geldiniz/iu,
  /disclaimer|not (a )?financial advice|opinions (are|in my content)|my own, not|kendi fikirlerim|şahsıma aittir|yatırım tavsiyesi değil|sorumluluk reddi/iu,
  /back with another post|bir yazımla geldim|yazmayı planladığım|planning to write|working on this article for a long time|vakit ayırmakta zorlandığım|içerik üretemedim|yazalı çok oldu|bir merhaba/iu,
  /içerik(ler)?(i)? üretiyorum|produce content (in|on)|without further ado|lafı (fazla )?uzatmadan/iu,
  /sorunuz (ya da|olursa|varsa)|any questions|contact me|teşekkür ederim|thank you/iu,
  /(article|part) of (my|the|this) series|seri(m|n)in \S+ yazısı|seriye devam|series that i started|article a series|yazıyı bir seri/iu,
  /girişten sıkıl|ho[şs] ?gel|başka bir yazımın konusu|subject of another article|^yine ben\b/iu,
  /independent of the companies|şirketlerden bağımsız|i hope you’?'?re excited|umarım heyecanlısınızdır/iu,
];

// "Merhabaaa değerli okuyucularım" without a comma after it
const GREETING_WITH_ADDRESS =
  /^(m+e+r+h+a+b+a+\S*|s+e+l+a+m+\S*|h+e+l+o+|h+i+)\s+(değerli|sevgili|my dear|dear)\s+(okuyucularım|arkadaşlarım|readers|friends)\b[,!.]*/iu;

// An emoji often ends a sentence in her writing ("…beklerim 😊 Bu içerik…"): keep the break
const SYMBOL_SENTENCE_END = new RegExp(`(?<![.!?])\\s*${SYMBOLS.source}+\\s+(?=\\p{Lu})`, "gu");

function usableText(text: string): string {
  const value = stripSymbols(text.replace(SYMBOL_SENTENCE_END, ". "))
    .replace(/([.!?])\s*\.(?=\s|$)/g, "$1")
    .replace(GREETING_WITH_ADDRESS, "")
    .trim()
    .replace(GREETING, "")
    .trim();
  if (/^https?:\/\//.test(value)) return "";
  // A short line ending in a colon introduces a list, it doesn't describe anything
  if (value.endsWith(":") && value.length < 60) return "";
  const sentences = value
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !FILLER.some((pattern) => pattern.test(sentence)));
  const rest = sentences.join(" ").replace(/^[\s,;:.!?–—-]+/, "");
  return rest.length >= 20 ? rest : "";
}

// A description reads as a sentence: capital first letter (Turkish rules for Turkish: i → İ)
const capitalize = (text: string, language: ContentLanguage) =>
  text.charAt(0).toLocaleUpperCase(language === "tr" ? "tr" : "en") + text.slice(1);

/** Up to 155 characters: whole sentences when they fill at least 110, otherwise cut at a word with "…" */
function fitDescription(text: string): string {
  if (text.length <= MAX_DESCRIPTION_LENGTH) return text;
  const window = text.slice(0, MAX_DESCRIPTION_LENGTH);
  const sentenceEnd = Math.max(...[". ", "! ", "? "].map((mark) => window.lastIndexOf(mark)));
  if (sentenceEnd + 1 >= MIN_DESCRIPTION_LENGTH) return window.slice(0, sentenceEnd + 1);
  return `${cutAtWord(text, MAX_DESCRIPTION_LENGTH - 1)}…`;
}

interface ArticleText {
  title: string;
  subtitle: string;
  paragraphs: { type: string; text: string }[];
}

/**
 * The meta description of an article. Medium's subtitle when it reads as one; otherwise the
 * opening of the body (paragraphs and quotes, skipping greetings, self-introductions, disclaimers
 * and labels); for an
 * article with neither, a sentence in the article's language.
 */
export function articleDescription(
  article: ArticleText,
  language: ContentLanguage,
  siteName: string,
): string {
  const subtitle = usableText(article.subtitle);
  // Medium fills an empty subtitle with the first sentence, cut off with "…"
  if (subtitle.length >= 70 && !/(…|\.{3})$/.test(subtitle)) {
    return capitalize(fitDescription(subtitle), language);
  }

  let text = "";
  for (const { type, text: paragraph } of article.paragraphs) {
    if (!["P", "BQ", "PQ"].includes(type)) continue;
    const usable = usableText(paragraph);
    if (!usable) continue;
    text = text ? `${text} ${usable}` : usable;
    if (text.length >= MAX_DESCRIPTION_LENGTH) break;
  }

  if (text.length >= 70) return capitalize(fitDescription(text), language);
  return articleFallbackDescription(stripSymbols(article.title), siteName, language);
}
