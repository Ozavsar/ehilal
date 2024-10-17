import { MEDIUM_USER_URL } from "@/config/constants";
import { getAllArticlePreviews, getSingleArticle } from "@/lib/medium";

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

  const cleanedContent = content
    .replace(new RegExp(blogTitle, "gi"), "")
    .replace(new RegExp(authorName, "gi"), "")
    .replace(new RegExp(readTime, "gi"), "")
    .replace(new RegExp(publishDate, "gi"), "")
    .replace(/<span\b[^>]*>\s*·\s*<\/span>/gi, "") // for replacing ·
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, "") // for removing anchor tags
    .replace(/<button[^>]*>.*?<\/button>/gi, "") // for removing buttons
    .replace(/<aside[^>]*>.*?<\/aside>/gi, "") // for removing asides
    .replace(/(Follow|Share|Clap|Comment|)/gi, ""); // for removing Follow, Share, Clap, Comment
  // .replace(/^\s*[\r\n]/gm, ""); // for removing empty lines

  return (
    <div className="mx-auto my-8 max-w-2xl rounded-lg p-8 text-blog-text-color shadow-lg">
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
  return articles
    .map((article, i) => {
      if (i === 0) {
        return {
          title: article.title,
        };
      } else return undefined;
    })
    .filter((article) => article !== undefined);
}
