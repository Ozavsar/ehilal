/**
 * Strapi serves the admin panel and the API, neither meant for search engines (the website is the
 * Next.js frontend): every response asks them not to index it, next to public/robots.txt. Set
 * before the rest of the stack runs, so error responses carry it too.
 */
export default () => {
  return async (ctx, next) => {
    ctx.set("X-Robots-Tag", "noindex, nofollow");
    await next();
  };
};
