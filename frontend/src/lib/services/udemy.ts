import { cache } from "react";
import { UDEMY_USER_ID } from "@/config/constants";
import type { ICourse } from "@/types";

const REVALIDATE = 60 * 60 * 24; // 24 hours

const UDEMY_PAGE_SIZE = 100; // Udemy API max
const MAX_UDEMY_PAGES = 10; // safety cap while following `next` links

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
  next: string | null;
  results: IUdemyCourse[];
}

// Every course, without blur placeholders (add them to the rendered page with withBlurDataURLs).
// The Udemy responses are in the fetch cache; cache() shares the result within one request.
export const getAllCourses = cache(async (): Promise<ICourse[]> => {
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

  let url: string | null =
    `https://www.udemy.com/api-2.0/users/${UDEMY_USER_ID}/taught-profile-courses/` +
    `?page=1&fields[course]=${encodeURIComponent(fields)}` +
    `&filter_hq_courses=true&ordering=lang&page_size=${UDEMY_PAGE_SIZE}`;

  // Fetch every course; pagination is done by the page, not the API
  const results: IUdemyCourse[] = [];
  for (let i = 0; url && i < MAX_UDEMY_PAGES; i++) {
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
    results.push(...(json.results ?? []));

    // Only follow links that stay on the Udemy API
    url = json.next?.startsWith("https://www.udemy.com/api-2.0/") ? json.next : null;
  }

  return results.map(
    (course): ICourse => ({
      title: course.title,
      headline: course.headline,
      contentInfo: course.content_info,
      instructionalLevel: course.instructional_level_simple,
      numReviews: String(course.num_reviews),
      rating: course.avg_rating ? course.avg_rating.toFixed(1) : null,
      udemyURL: `https://www.udemy.com${course.url}`,
      thumbnailURL: course.image_480x270 || null,
    }),
  );
});
