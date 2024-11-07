"use client";
import React, { useEffect, useState } from "react";
import { IBlog } from "@/config/types";
import ArticleCard from "./ArticleCard";

const BlogList = () => {
  const [blogs, setBlogs] = useState<IBlog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/blogs");
        const data = await res.json();

        if (res.ok) {
          setBlogs(data.blogs);
        } else {
          setError(data.message || "Failed to load blogs.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      {blogs.map((blog) => (
        <ArticleCard key={blog._id} {...blog} />
      ))}
    </>
  );
};

export default BlogList;
