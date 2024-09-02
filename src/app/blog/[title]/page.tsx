import puppeteer from "puppeteer";

export default async function Blog({
  params: { title },
}: {
  params: { title: string };
}) {
  const blogUrl = `https://medium.com/@Elifhilalumucu/${title}`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(blogUrl, { waitUntil: "networkidle2" });

  const { content, rawText } = await page.evaluate(() => {
    const article = document.querySelector("article");
    const content = article ? article.innerHTML : "";

    const rawText = article ? article.innerText : "";

    return { content, rawText };
  });

  await browser.close();

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
    <div className="text-blog-text-color mx-auto my-8 max-w-2xl rounded-lg bg-muted p-8 shadow-lg">
      <div className="mb-6">
        <h1 className="text-blog-text-color mb-2 text-3xl font-bold">
          {blogTitle}
        </h1>
        <div className="mb-4 flex items-center">
          <div className="text-secondary-blog-text-color text-sm">
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
