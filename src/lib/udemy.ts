import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { Page } from "puppeteer";
import { UDEMY_USER_URL } from "@/config/constants";
import type { ICourse } from "@/types.d";

puppeteer.use(StealthPlugin());

export const getAllCourses = async (): Promise<ICourse[]> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
  );

  await page.goto(UDEMY_USER_URL, { waitUntil: "networkidle2" });
  await autoScroll(page);

  const courses = await page.evaluate(() => {
    const courseElements = document.querySelectorAll(
      "div[data-purpose='course-card-container']",
    );
    const courseList: ICourse[] = [];

    courseElements.forEach((courseElement) => {
      const titleElement = courseElement.querySelector(
        "h3[data-purpose='course-title-url'] a",
      );
      const headlineElement = courseElement.querySelector(
        "span[data-testid='seo-headline']",
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
          thumbnailURL: thumbnailElement?.getAttribute("src") || null,
        });
      }
    });

    return courseList;
  });

  await browser.close();
  return courses;
};

async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
