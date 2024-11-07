import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Blog from '@/models/Blog';
import type { IBlog } from '@/config/types';

export async function POST(req: Request): Promise<Response> {
  await connectMongo();
  const { title, slug, description, content }: IBlog = await req.json();

  try {
    const newBlog = await Blog.create({ title, slug, description, content });
    return NextResponse.json({ message: 'Blog saved successfully!', blog: newBlog });
  } catch (error) {
    console.error("Error saving blog:", error);

    const errorMessage = (error instanceof Error ? error.message : 'An unexpected error occurred while saving the blog. Please try again later.');
    return NextResponse.json({ message: `Blog save failed: ${errorMessage}` }, { status: 400 });
  }

}


