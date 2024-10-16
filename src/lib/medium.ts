import { MEDIUM_USER_URL } from "@/config/constants";
import { IArticlePreview } from "@/config/types";
import puppeteer, { Page } from "puppeteer";

export const getAllArticlePreviews = async (): Promise<IArticlePreview[]> => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(MEDIUM_USER_URL, { waitUntil: "networkidle2" });

  await autoScroll(page); // Perform auto-scrolling to load more articles

  const articles = await page.evaluate(() => {
    const articleElements = document.querySelectorAll("article");
    const articleList: IArticlePreview[] = [];

    articleElements.forEach((article) => {
      const titleElement = article.querySelector("h2");
      const linkElements = article.querySelectorAll("a");
      const imageElement = article.querySelectorAll("img")[1];
      const descriptionElement = article.querySelector("h3");

      let validUrl = null;

      linkElements.forEach((link) => {
        // do not replace below url with MEDIM_USER_URL, it will not work
        if (link.href.startsWith("https://medium.com/@Elifhilalumucu/")) {
          validUrl = link.href;
        }
      });

      if (titleElement && validUrl) {
        articleList.push({
          title: titleElement.innerText,
          url: validUrl,
          image: imageElement?.src.replace(/\/resize:fill:\d+:\d+\//, "/"),
          description: descriptionElement?.innerText,
        });
      }
    });

    return articleList;
  });

  await browser.close();

  return articles;
};

async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100; // Scroll distance
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve({});
        }
      }, 100);
    });
  });
}

export const getSingleArticle = async (url: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  const { content, rawText } = await page.evaluate(() => {
    const article = document.querySelector("article");
    const content = article ? article.innerHTML : "";

    const rawText = article ? article.innerText : "";

    return { content, rawText };
  });

  await browser.close();

  return { content, rawText };
};
