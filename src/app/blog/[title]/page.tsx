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

  const content = await page.evaluate(() => {
    const article = document.querySelector("article");
    return article ? article.innerHTML : "";
  });

  await browser.close();
  return (
    <div>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
