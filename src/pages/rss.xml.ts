import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const blog = await getCollection("blog");

  // Filter out drafts and get latest 20 posts
  const publishedPosts = blog
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 20);

  return rss({
    title: "ywc.life",
    description: "ywc의 개발 경험과 학습을 기록하는 공간입니다.",
    site: context.site || "https://ywc.life",
    items: publishedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/posts/${post.slug}`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: `<language>ko-kr</language>`,
  });
}
