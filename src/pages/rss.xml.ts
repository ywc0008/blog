import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const blog = await getCollection("blog");

  const publishedPosts = blog
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .slice(0, 20);

  const siteURL = context.site ?? new URL("https://ywc.life");
  const siteBase = siteURL.toString().replace(/\/$/, "");

  return rss({
    title: "ywc.life",
    description: "ywc의 개발 경험과 학습을 기록하는 공간입니다.",
    site: siteURL,
    xmlns: {
      atom: "http://www.w3.org/2005/Atom",
    },
    items: publishedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: new URL(`/posts/${post.slug}`, siteURL).toString().replace(/\/$/, ""),
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: [
      `<language>ko-kr</language>`,
      `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      `<atom:link href="${siteBase}/rss.xml" rel="self" type="application/rss+xml" />`,
      `<managingEditor>noreply@ywc.life (ywc)</managingEditor>`,
      `<image><url>${siteBase}/og/default.png</url><title>ywc.life</title><link>${siteBase}</link></image>`,
    ].join(""),
  });
}
