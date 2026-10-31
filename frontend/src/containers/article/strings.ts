import type { ContentLanguage } from "@/lib/language";

// Text around the Medium content, in the article's language: a Turkish article gets a Turkish
// byline, contents label, image buttons and end-of-article links. The site chrome outside the
// article column (navigation, "Back to blog", the full-screen gallery) stays English.
const EN = {
  locale: "en-US",
  minutesRead: (minutes: number) => `${minutes} min read`,
  updated: "Updated",
  onThisPage: "On this page",
  contents: "Contents",
  opensInNewTab: "(opens in a new tab)",
  enlargeImage: (caption: string) => `Enlarge image: ${caption}`,
  enlargeImageAt: (position: number, total: number) => `Enlarge image ${position} of ${total}`,
  enlargeCover: "Enlarge cover image",
  playAnimation: "Play animation",
  pauseAnimation: "Pause animation",
  openDocument: "Opens the document in a new tab",
  originallyPublished: "Originally published on Medium",
  lockedTitle: "Member-only story",
  lockedText: "Medium shares only the beginning of this story. The full article is on Medium.",
  readFullOnMedium: "Read the full article on Medium",
  // Label of a link to this language's version, written in this language
  readInThisLanguage: "Read in English",
  seriesTitle: "More from this series",
  previousPart: "Previous part",
  nextPart: "Next part",
  relatedTitle: "Related articles",
};

export type ArticleStrings = typeof EN;

export const ARTICLE_STRINGS: Record<ContentLanguage, ArticleStrings> = {
  en: EN,
  tr: {
    locale: "tr-TR",
    minutesRead: (minutes: number) => `${minutes} dk okuma`,
    updated: "Güncellendi:",
    onThisPage: "Bu sayfada",
    contents: "İçindekiler",
    opensInNewTab: "(yeni sekmede açılır)",
    enlargeImage: (caption: string) => `Görseli büyüt: ${caption}`,
    enlargeImageAt: (position: number, total: number) => `Görseli büyüt (${position}/${total})`,
    enlargeCover: "Kapak görselini büyüt",
    playAnimation: "Animasyonu oynat",
    pauseAnimation: "Animasyonu duraklat",
    openDocument: "Belgeyi yeni sekmede açar",
    originallyPublished: "İlk olarak Medium'da yayımlandı",
    lockedTitle: "Üyelere özel yazı",
    lockedText: "Medium bu yazının yalnızca başını paylaşıyor. Yazının tamamı Medium'da.",
    readFullOnMedium: "Yazının tamamını Medium'da oku",
    readInThisLanguage: "Türkçe oku",
    seriesTitle: "Serinin diğer bölümleri",
    previousPart: "Önceki bölüm",
    nextPart: "Sonraki bölüm",
    relatedTitle: "İlgili yazılar",
  },
};

// Pin the time zone so the day doesn't depend on the server (same as the blog cards)
const DATE_OPTIONS = { timeZone: "Europe/Istanbul", year: "numeric", day: "numeric" } as const;

/** "14 Kasım 2025" / "November 14, 2025" (month "short": "14 Kas 2025" / "Nov 14, 2025"); null
 * for a missing or invalid ISO date */
export function formatArticleDate(
  iso: string | undefined,
  language: ContentLanguage,
  month: "long" | "short" = "long",
) {
  const date = iso ? new Date(iso) : null;
  if (!date || isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(ARTICLE_STRINGS[language].locale, {
    ...DATE_OPTIONS,
    month,
  }).format(date);
}
