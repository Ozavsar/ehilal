"use client";
import ArticleCard from "./article-card";
import type { IBlog } from "@/types.d";

const BlogList = (articles: IBlog[]) => {
  return (
    <>
      {articles.map((blog) => (
        <ArticleCard key={blog._id} {...blog} />
      ))}
    </>
  );
};

export default BlogList;
