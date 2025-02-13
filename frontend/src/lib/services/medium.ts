import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { blogDummyData } from "@/config/constants/dummy-data";
import { MEDIUM_USER_URL } from "@/config/constants";
import { autoScroll } from "../utils";
import type { IBlog } from "@/types.d";

process.env.NODE_ENV === "production" && puppeteer.use(StealthPlugin());

export const getAllArticlePreviews = async () => {
  if (process.env.NODE_ENV === "development") {
    // Instead of scraping, return dummy data
    return blogDummyData;
  } else {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 200000,
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    );

    await page.goto(MEDIUM_USER_URL, {
      waitUntil: "networkidle2",
      timeout: 200000,
    });
    await autoScroll(page);

    const articles = await page.evaluate(() => {
      const articleElements = document.querySelectorAll("article");
      const articleList: IBlog[] = [];

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
            mediumURL: validUrl,
            thumbnailURL: imageElement?.src.replace(
              /\/resize:fill:\d+:\d+\//,
              "/",
            ),
            description: descriptionElement?.innerText,
          });
        }
      });

      return articleList;
    });

    // @todo: Remove limit before the final product
    const limitedArticles = articles.slice(0, 3);

    await browser.close();
    return limitedArticles;
  }
};

export const getSingleArticle = async (url: string) => {
  if (process.env.NODE_ENV === "development") {
    // Instead of scraping, return dummy data
    const content = `<p>Dummy content for ${url}</p>`;
    const rawText = `Dummy raw text for ${url}`;

    return { content, rawText };
  } else {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    const { content, rawText } = await page.evaluate(() => {
      const article = document.querySelector("article");
      const content = article?.innerHTML || "No Content";
      const rawText = article?.innerText || "No Raw Text";
      return { content, rawText };
    });

    await browser.close();
    return { content, rawText };
  }
};
