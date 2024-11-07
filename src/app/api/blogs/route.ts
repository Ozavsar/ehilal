import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Blog from '@/models/Blog';
import type { IBlog } from '@/config/types';

export async function GET(): Promise<Response> {
  await connectMongo();

  try {
    // Fetch blogs sorted by createdAt in descending order
    const blogs = await Blog.find().sort({ createdAt: -1 }).exec();
    return NextResponse.json({ message: 'Blogs retrieved successfully!', blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred while fetching the blogs.';
    return NextResponse.json({ message: `Failed to retrieve blogs: ${errorMessage}` }, { status: 500 });
  }
}
