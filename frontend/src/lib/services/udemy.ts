import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { UDEMY_USER_URL } from "@/config/constants";
import { autoScroll } from "../utils";
import type { ICourse } from "@/types.d";

process.env.NODE_ENV === "production" && puppeteer.use(StealthPlugin());

export const getAllCourses = async () => {
  // Instead of scraping, return dummy data

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  );

  await page.goto(UDEMY_USER_URL, {
    waitUntil: "networkidle2",
  });
  await autoScroll(page);

  const courses = await page.evaluate(() => {
    const courseElements = document.querySelectorAll(
      "section[class*='vertical-card-module--card--']",
    );
    const courseList: ICourse[] = [];

    courseElements.forEach((courseElement) => {
      const titleElement = courseElement.querySelector(
        "h3[class*='card-title-module--title--'] a",
      );
      const headlineElement = courseElement.querySelector(
        "span[data-purpose='safely-set-inner-html:course-card:course-headline']",
      );
      const ratingElement = courseElement.querySelector(
        "span[data-testid='seo-rating']",
      );
      const contentInfoElement = courseElement.querySelector(
        "span[data-testid='seo-content-info']",
      );
      const numReviews = courseElement.querySelector(
        "span[data-testid='seo-num-reviews']",
      );
      const numLecturesElement = courseElement.querySelector(
        "span[data-testid='seo-num-lectures']",
      );
      const instructionalLevelElement = courseElement.querySelector(
        "span[data-testid='seo-instructional-level']",
      );
      const thumbnailElement = courseElement.querySelector("img");

      const thumbnailElementBig = thumbnailElement
        ? thumbnailElement
            .getAttribute("srcset")
            ?.split(", ")
            .map((src) => {
              const [url, size] = src.split(" ");
              return { url, width: parseInt(size) };
            })
            .sort((a, b) => b.width - a.width)[0]?.url
        : null;

      if (titleElement) {
        courseList.push({
          title:
            (titleElement.firstChild as HTMLElement)?.textContent?.trim() ||
            "No Title",
          headline: headlineElement?.textContent?.trim() || "No Headline",
          rating:
            ratingElement?.textContent?.split(":")[1].split("/")[0].trim() ||
            "No Rating",
          contentInfo:
            contentInfoElement?.textContent?.trim() || "No Content Info",
          numLectures:
            numLecturesElement?.textContent?.trim() || "No Lectures Info",
          numReviews: numReviews?.textContent?.trim() || "No Reviews",
          instructionalLevel:
            instructionalLevelElement?.textContent?.trim() || "No Level Info",
          udemyURL:
            "https://www.udemy.com" + titleElement.getAttribute("href") ||
            "No URL",
          thumbnailURL: thumbnailElementBig || null,
        });
      }
    });

    return courseList;
  });

  await browser.close();
  return courses;
};
