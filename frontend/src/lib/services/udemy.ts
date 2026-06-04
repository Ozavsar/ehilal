import { UDEMY_USER_ID, ITEMS_PER_PAGE } from "@/config/constants";
import { getImage } from "../getImage";
import type { ICourse } from "@/types";

export const REVALIDATE = 60 * 60 * 24; // 24 hours

interface IUdemyCourse {
  title: string;
  url: string;
  headline: string;
  content_info: string;
  instructional_level_simple: string;
  avg_rating: number;
  num_reviews: number;
  image_480x270: string;
}

interface IUdemyResponse {
  count: number;
  results: IUdemyCourse[];
}

export const getAllCourses = async (): Promise<ICourse[]> => {
  const fields = [
    "@default",
    "headline",
    "instructional_level_simple",
    "avg_rating",
    "num_reviews",
    "content_info",
    "rating",
    "image_100x100",
  ].join(",");

  const url =
    `https://www.udemy.com/api-2.0/users/${UDEMY_USER_ID}/taught-profile-courses/` +
    `?page=1&fields[course]=${encodeURIComponent(fields)}` +
    `&filter_hq_courses=true&ordering=lang&page_size=${ITEMS_PER_PAGE}`;

  console.log("Fetching Udemy courses from:", url);

  const res = await fetch(url, {
    cache: "force-cache",
    next: {
      tags: ["courses"],
      revalidate: REVALIDATE,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Udemy courses: ${res.status} ${res.statusText}`);
  }

  const json: IUdemyResponse = await res.json();
  const results = json.results ?? [];

  const courses = await Promise.all(
    results.map(async (course): Promise<ICourse> => {
      const thumbnailURL = course.image_480x270 || null;

      let blurDataURL: string | undefined;
      if (thumbnailURL) {
        try {
          blurDataURL = (await getImage(thumbnailURL)).base64;
        } catch {
          console.warn("Udemy placeholder alınamadı:", thumbnailURL);
        }
      }

      return {
        title: course.title,
        headline: course.headline,
        contentInfo: course.content_info,
        instructionalLevel: course.instructional_level_simple,
        numReviews: String(course.num_reviews),
        rating: course.avg_rating ? course.avg_rating.toFixed(1) : null,
        udemyURL: `https://www.udemy.com${course.url}`,
        thumbnailURL,
        blurDataURL,
      };
    }),
  );

  return courses;
};
