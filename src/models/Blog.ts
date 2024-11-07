import { Schema, model, models } from 'mongoose';
import type { IBlog } from '@/config/types';

const blogSchema = new Schema<IBlog>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  // thumbnailUrl: { type: String, required: true },
}, { timestamps: true });

const Blog = models.Blog || model('Blog', blogSchema);

export default Blog;

