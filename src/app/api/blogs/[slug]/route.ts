import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  await connectMongo();

  const { slug } = params;

  try {
    const blog = await Blog.findOne({ slug }).exec();

    if (blog) {
      return NextResponse.json({ blog }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Blog not found in the database.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ message: 'Error fetching blog from database.' }, { status: 500 });
  }
}
