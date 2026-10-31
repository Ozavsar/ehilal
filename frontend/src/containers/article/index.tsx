import { articleReveal } from "@/components/view-transitions";
import type { ArticleTranslation } from "@/config/translations";
import type { ContentLanguage } from "@/lib/language";
import { getSiteSettings } from "@/lib/services";
import { getRemovedUrls, getUnconvertedMediumImages } from "@/lib/services/article-media";
import { getArticlesForLinks } from "@/lib/services/blog";
import type { IBlog } from "@/types";
import { RelatedArticles, SeriesNavigation } from "./article-end";
import { getArticleLinks } from "./article-links";
import MediumRenderer, { getGiphyId, giphyUrl } from "./medium-renderer";

interface IArticleContainerProps {
  article: IBlog;
  language: ContentLanguage;
  /** ISO 8601 dates from the article list; undefined when the list can't load */
  publishedAt?: string;
  updatedAt?: string;
  /** The same article in the other language, when it was published in both */
  translation: ArticleTranslation | null;
}

export default async function ArticleContainer({
  article,
  language,
  publishedAt,
  updatedAt,
  translation,
}: IArticleContainerProps) {
  const imageIds = article.paragraphs.flatMap((p) =>
    p.type === "IMG" && p.metadata ? [p.metadata.id] : [],
  );
  const giphyPosters = article.paragraphs.flatMap((p) => {
    const giphyId = p.iframe ? getGiphyId(p.iframe.mediaResource.iframeSrc) : null;
    return giphyId ? [giphyUrl(giphyId, "480w_s.jpg")] : [];
  });
  // All cached: the page already loaded settings and list, media checks are cached per URL
  const [{ siteName }, articles, animatedImages, removedMedia] = await Promise.all([
    getSiteSettings(),
    getArticlesForLinks(),
    getUnconvertedMediumImages(imageIds),
    getRemovedUrls(giphyPosters),
  ]);
  const { postPaths, series, related } = getArticleLinks(articles, article, language, translation);

  return (
    // <main> is the (client) template's
    <div className="px-4 pt-4 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
      <MediumRenderer
        postId={article.id}
        title={article.title}
        subtitle={article.subtitle}
        previewImage={article.previewImage}
        paragraphs={article.paragraphs}
        mediumUrl={article.mediumUrl}
        isLocked={article.isLocked}
        language={language}
        author={siteName}
        publishedAt={publishedAt}
        updatedAt={updatedAt}
        translation={translation}
        postPaths={postPaths}
        animatedImages={animatedImages}
        removedMedia={removedMedia}
        after={
          (series || related.length > 0) && (
            <div {...articleReveal(3)}>
              {series && <SeriesNavigation series={series} language={language} />}
              {related.length > 0 && <RelatedArticles articles={related} language={language} />}
            </div>
          )
        }
      />
    </div>
  );
}
