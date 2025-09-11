import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { MEDIUM_USER_URL } from "@/config/constants";
import { autoScroll } from "../utils";

process.env.NODE_ENV === "production" && puppeteer.use(StealthPlugin());

export const getAllArticlePreviews = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  );

  await page.goto(MEDIUM_USER_URL, {
    waitUntil: "networkidle2",
  });
  await autoScroll(page);

  const articles = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("article")).map((article) => {
      const title = article.querySelector("h2")?.innerText || "No Title";
      const description =
        article.querySelector("h3")?.innerText || "No Description";
      const imgs = article.querySelectorAll("img");
      let img = "";

      if (imgs.length === 1) {
        img = imgs[0].src;
      } else if (imgs.length >= 2) {
        img = imgs[1].src;
      }
      const link =
        Array.from(article.querySelectorAll("a"))
          .map((a) => a.href)
          .find((href) => href.includes("//medium.com/")) || "";

      let pubDate = "No Date";
      const spanElements = Array.from(article.querySelectorAll("span"));

      for (const span of spanElements) {
        const text = span.textContent || "";

        const match = text.match(/\b\w+ \d{1,2}(?:, \d{4})?\b/);
        if (match) {
          const dateStr = text;
          if (!/\d{4}/.test(dateStr)) {
            const currentYear = new Date().getFullYear();
            pubDate = `${dateStr}, ${currentYear}`;
          } else {
            const match = dateStr.match(/^[A-Za-z]+\s+\d{1,2},\s+\d{4}/);
            pubDate = match ? match[0] : dateStr;
          }
          break;
        }
      }

      return {
        title,
        mediumURL: link,
        thumbnailURL: img.replace(/\/resize:fill:\d+:\d+\//, "/"),
        description,
        pubDate,
      };
    });
  });

  await browser.close();

  return articles;
};
