import type { BlogPost } from "../types";

/**
 * Convert a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Calculate reading time in minutes
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
}

/**
 * Sort posts by publication date (newest first)
 */
export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return posts.sort((a, b) => {
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });
}

/**
 * Filter out draft posts
 */
export function filterDrafts(posts: BlogPost[]): BlogPost[] {
  return posts.filter((post) => !post.draft);
}

/**
 * Get posts by category
 */
export function getPostsByCategory(posts: BlogPost[], category: string): BlogPost[] {
  return posts.filter((post) => post.category.toLowerCase() === category.toLowerCase());
}

/**
 * Get posts by tag
 */
export function getPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  return posts.filter((post) => post.tags.some((t) => t.toLowerCase() === tag.toLowerCase()));
}

/**
 * Get all unique tags from posts
 */
export function getAllTags(posts: BlogPost[]): string[] {
  const tags = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });
  return Array.from(tags).sort();
}
