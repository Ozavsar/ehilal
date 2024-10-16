import { MEDIUM_USER_URL } from "@/config/constants";
import { getAllArticlePreviews, getSingleArticle } from "@/lib/medium";

export const revalidate = 60 * 60 * 24; // 24 hours

export const dynamicParams = false; // 404 on unknown paths instead of dynamically generating the page

export default async function Blog({ params }: { params: { title: string } }) {
  const { content, rawText } = await getSingleArticle(
    `${MEDIUM_USER_URL}/${params.title}`,
  );

  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);
  const blogTitle = lines[0] || "No Title Found";
  const authorName = lines[1] || "No Author Found";
  const readTime =
    lines.find((line) => line.includes("min read")) || "No Read Time Found";
  const publishDate =
    lines.find((line) => /\b\d{4}\b/.test(line)) || "No Publish Date Found";

  let cleanedContent = content
    .replace(new RegExp(blogTitle, "gi"), "")
    .replace(new RegExp(authorName, "gi"), "")
    .replace(new RegExp(readTime, "gi"), "")
    .replace(new RegExp(publishDate, "gi"), "")
    .replace(/<div[^>]*>(Follow|Share|Clap|Comment|\.|[0-9]+)<\/div>/gi, "")
    .replace(/<figure[^>]*>.*?<\/figure>/gi, "")
    .replace(/<\/?a[^>]*>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<button[^>]*>.*?<\/button>/gi, "")
    .replace(/<svg[^>]*>.*?<\/svg>/gi, "")
    .replace(/·/g, "")
    .replace(/^\s*[\r\n]/gm, "");

  cleanedContent = cleanedContent.replace(
    /(Follow|Share|Clap|Comment|\b\d+\b|[.|•]+)/gi,
    "",
  );

  return (
    <div className="mx-auto my-8 max-w-2xl rounded-lg bg-muted p-8 text-blog-text-color shadow-lg">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-blog-text-color">
          {blogTitle}
        </h1>
        <div className="mb-4 flex items-center">
          <div className="text-sm text-secondary-blog-text-color">
            <p className="leading-none text-primary">{authorName}</p>
            <p className="text-gray-600">
              {publishDate} • {readTime}
            </p>
          </div>
        </div>
      </div>

      <div
        dangerouslySetInnerHTML={{ __html: cleanedContent }}
        className="prose lg:prose-lg text-blog-text-color"
      />
    </div>
  );
}

// This function gets called at build time
export async function generateStaticParams() {
  const articles = await getAllArticlePreviews();

  // Get the paths we want to pre-render based on posts
  return articles.map((article) => ({
    title: article.title,
  }));
}
