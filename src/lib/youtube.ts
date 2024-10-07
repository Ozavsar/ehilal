// import { google } from 'googleapis'

// const youtube = google.youtube({
//   version: 'v3',
//   auth: process.env.YOUTUBE_API_KEY,
// })

// export async function getYoutubeVideos(query: string, page: number, pageSize: number) {
//   const response = await youtube.search.list({
//     part: ['snippet'],
//     channelId: process.env.YOUTUBE_CHANNEL_ID,
//     maxResults: pageSize,
//     order: 'date',
//     type: ['video'],
//     q: query,
//     pageToken: page > 1 ? await getPageToken(page, pageSize, query) : undefined,
//   })

//   const videos = response.data.items.map((item) => ({
//     id: item.id.videoId,
//     title: item.snippet.title,
//     description: item.snippet.description,
//     thumbnail: item.snippet.thumbnails.high.url,
//     publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
//     views: 'N/A', // YouTube API v3 doesn't provide view count in search results
//   }))

//   const totalResults = response.data.pageInfo.totalResults
//   const totalPages = Math.ceil(totalResults / pageSize)

//   return { videos, totalPages }
// }

// async function getPageToken(page: number, pageSize: number, query: string) {
//   let token = ''
//   for (let i = 1; i < page; i++) {
//     const response = await youtube.search.list({
//       part: ['snippet'],
//       channelId: process.env.YOUTUBE_CHANNEL_ID,
//       maxResults: pageSize,
//       order: 'date',
//       type: ['video'],
//       q: query,
//       pageToken: token,
//     })
//     token = response.data.nextPageToken
//   }
//   return token
// }

// export async function getYoutubeVideoById(id: string) {
//   const response = await youtube.videos.list({
//     part: ['snippet', 'statistics'],
//     id: [id],
//   })

//   const video = response.data.items[0]
//   if (!video) return null

//   return {
//     id: video.id,
//     title: video.snippet.title,
//     description: video.snippet.description,
//     thumbnail: video.snippet.thumbnails.high.url,
//     publishedAt: new Date(video.snippet.publishedAt).toLocaleDateString(),
//     views: video.statistics.viewCount,
//   }
// }