"use client";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import parse from "html-react-parser";
import { generateSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
export default function Editor() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleTitle(e: React.ChangeEvent<HTMLInputElement>): void {
    const newTitle = e.target.value;
    setTitle(newTitle);
    const autoSlug = generateSlug(newTitle);
    setSlug(autoSlug);
  }


  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/blogs/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        slug,
        description,
        content,
      }),
    });

    // Sunucudan gelen yanıtın başarılı olup olmadığını kontrol edelim
    if (!res.ok) {
      setError("Sunucu hatası: " + res.status);
      return;
    }

    // Eğer JSON yanıt varsa çöz
    let data;
    try {
      data = await res.json();
    } catch (err) {
      console.error("Yanıt JSON değil:", err);
      data = {}; // JSON olmadığı durumda boş bir obje döndür
    }

    if (res.ok) {
      router.push("/blog");
    } else {
      setError(data.message || "Bir hata oluştu.");
    }
  };

  //Custom Tool Bar
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "color", "image"],
      [{ "code-block": true }],
      ["clean"],
    ],
  };
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "indent",
    "image",
    "code-block",
    "color",
  ];
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 p-8 lg:grid-cols-2">
        {error && <p className="mb-4 text-red-500">{error}</p>}
        {/* Blog Editor */}
        <div className="mx-auto my-6 w-full max-w-3xl rounded-lg bg-muted p-5 shadow">
          <h2 className="mb-5 border-b border-primary pb-2 text-3xl font-bold">
            Blog Editor
          </h2>
          <form onSubmit={handleAddBlog}>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              {/* Title */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium leading-6"
                >
                  Blog Title
                </label>
                <div className="mt-2">
                  <input
                    onChange={handleTitle}
                    type="text"
                    value={title}
                    name="title"
                    id="title"
                    autoComplete="given-name"
                    className="block w-full rounded-md border-0 px-4 py-2 shadow-sm ring-1 ring-inset ring-background placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Type the Course title"
                  />
                </div>
              </div>
              {/* Slug */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-medium leading-6"
                >
                  Blog Slug
                </label>
                <div className="mt-2">
                  <input
                    onChange={(e) => setSlug(e.target.value)}
                    type="text"
                    value={slug}
                    name="slug"
                    id="slug"
                    autoComplete="slug"
                    className="block w-full rounded-md border-0 px-4 py-2 shadow-sm ring-1 ring-inset ring-background placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                    placeholder="Type the Course title"
                  />
                </div>
              </div>
              {/* Description */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium"
                >
                  Blog Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                  className="block w-full rounded-lg border border-background bg-background p-2.5 text-sm focus:border-primary focus:ring-primary"
                  placeholder="Write your thoughts here..."
                ></textarea>
              </div>
              {/* Content */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="content"
                  className="mb-2 block text-sm font-medium dark:text-white"
                >
                  Blog Content
                </label>
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  className="bg-background"
                />
              </div>
            </div>
            <Button type="submit">
              <Plus className="mr-2 h-5 w-5" />
              <span>Create Blog Post</span>
            </Button>
          </form>
        </div>

        {/* Blog View */}
        <div className="blog-view mx-auto my-6 w-full max-w-3xl rounded-lg border border-background bg-muted p-5 shadow">
          <h2 className="mb-5 border-b border-primary pb-2 text-3xl font-bold">
            Blog View
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {/* Title */}
            <div className="sm:col-span-2">
              <h2 className="mb-2 block text-sm font-medium leading-6">
                Blog Title
              </h2>
              <div className="mt-2">
                <p className="text-2xl font-bold">{title}</p>
              </div>
            </div>
            {/* Slug */}
            <div className="sm:col-span-2">
              <h2 className="mb-2 block text-sm font-medium leading-6">
                Blog Slug
              </h2>
              <div className="mt-2">
                <p>{slug}</p>
              </div>
            </div>
            {/* Description */}
            <div className="sm:col-span-2">
              <h2 className="mb-2 block text-sm font-medium dark:text-white">
                Blog Description
              </h2>
              <p>{description}</p>
            </div>
            <div className="sm:col-span-full">
              <h2 className="mb-2 block text-sm font-medium dark:text-white">
                Blog Content
              </h2>
              {parse(content)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
