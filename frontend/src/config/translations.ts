import type { ContentLanguage } from "@/lib/language";

// Medium posts published in both languages, as [Turkish post id, English post id], paired by hand
// (not by title alone: "Web3 Nedir?" and "Overview of Web3" are different articles)
const TRANSLATION_PAIRS: [tr: string, en: string][] = [
  ["78cbb82ef631", "29e671566db9"], // Blockchain'e giriş rehberi
  ["62dfda5df6fb", "1288132ff56e"], // Dünyadan regülasyonlar ve örnek davalar #1
  ["32dff425a5cc", "4f3cebc5dc62"], // … #2
  ["1d859f81147f", "4065aa89c6a5"], // … #3
  ["b011c97f2e2b", "d560c69d3b85"], // … #4
  ["4ffe7dbb0279", "ed4eb2f3647e"], // NFT ve dinamik NFT rehberi
  ["2d2861b5c118", "c8b10636a307"], // Zero knowledge ve layer 2 rehberi
  ["479005cf9737", "2dfc9ba06420"], // Purdue serisi #4 kriptografi / My Cryptography Guide
  ["d773a80fafb2", "938fef94f8e0"], // Bir NFT projesini başarılı yapan adımlar
  ["8f0880409b4c", "ff40528f345e"], // a16z State of Crypto 2023
  ["b2ee6fa71df4", "24e3654bb162"], // CCIP rehberi
];

/** The other language's version of an article, as the article page links to it */
export interface ArticleTranslation {
  language: ContentLanguage;
  title: string;
  /** Site path of the article (/blog/<slug>) */
  path: string;
}

/** The other language's version of a Medium post, if it was published in both */
export function getTranslation(postId: string): { id: string; language: ContentLanguage } | null {
  for (const [tr, en] of TRANSLATION_PAIRS) {
    if (postId === tr) return { id: en, language: "en" };
    if (postId === en) return { id: tr, language: "tr" };
  }
  return null;
}
