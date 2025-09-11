// Example implementation to fetch Medium posts via RSS feed (not currently used because of limitations, it return only 10 posts)

// import { XMLParser } from "fast-xml-parser";
// import type { IBlog } from "@/types";

// export async function getMediumPosts(username: string): Promise<IBlog[]> {
//   const feedUrl = ` `;
//   const res = await fetch(feedUrl, { next: { revalidate: 3600 } }); // 1 saat cache

//   if (!res.ok) throw new Error("Failed to fetch Medium RSS");

//   const xml = await res.text();
//   const parsed = new XMLParser().parse(xml);
//   const items = parsed.rss?.channel?.item ?? [];

//   return items.map((item: any) => {
//     const rawDesc = item["content:encoded"] || item.description || "";
//     const plainDesc = rawDesc.replace(/<[^>]+>/g, "").slice(0, 180) + "...";

//     let thumbnail: string | undefined;
//     if (item["media:thumbnail"]?.url) {
//       thumbnail = item["media:thumbnail"].url;
//     } else {
//       const match = rawDesc.match(/<img[^>]+src="([^"]+)"/);
//       if (match) thumbnail = match[1];
//     }

//     return {
//       title: item.title,
//       link: item.link,
//       description: plainDesc,
//       thumbnail,
//       pubDate: item.pubDate,
//     };
//   });
// }
