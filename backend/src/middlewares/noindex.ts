/**
 * Keeps search engines out of the admin and the API (the website is the Next.js frontend). Set
 * before next(), so error responses carry it too.
 */
export default () => {
  return async (ctx, next) => {
    ctx.set("X-Robots-Tag", "noindex, nofollow");
    await next();
  };
};
