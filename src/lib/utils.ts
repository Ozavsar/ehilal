import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function truncateDescription(description: string): string {
  const words = description.split(/\s+/);
  if (words.length <= 20) {
    return description;
  }
  return words.slice(0, 20).join(' ') + '...';
}
