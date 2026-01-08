// Blog post types
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  heroImage?: string;
  category: string;
  tags: string[];
  draft: boolean;
}

// Category types
export interface Category {
  name: string;
  slug: string;
  description?: string;
}

// Tag type
export type Tag = string;

// Theme types
export type Theme = "light" | "dark";

// Search index entry
export interface SearchIndexEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  pubDate: string;
}

// Component props types
export interface PostListProps {
  posts: BlogPost[];
  showPagination?: boolean;
}

export interface PostDetailProps {
  post: BlogPost;
  content: string;
}

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}
