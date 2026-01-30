import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import categories from "../content/categories.json";

export async function GET(context: APIContext) {
  const blog = await getCollection("blog");

  const publishedPosts = blog
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const siteUrl = (context.site || "https://ywc.life").toString().replace(/\/$/, "");

  const lines: string[] = [
    "# ywc.life",
    "",
    "> 개발하면서 배운 것들을 정리하고, 유용한 라이브러리를 소개하는 기술 블로그입니다.",
    "",
    "## 카테고리",
    "",
  ];

  for (const cat of categories) {
    const count = publishedPosts.filter((p) => p.data.category === cat.name).length;
    lines.push(
      `- [${cat.name}](${siteUrl}/categories/${cat.slug}/): ${cat.description} (${count}개 포스트)`
    );
  }

  lines.push("", "## 최근 포스트", "");

  for (const post of publishedPosts.slice(0, 20)) {
    const date = post.data.pubDate.toISOString().split("T")[0];
    lines.push(
      `- [${post.data.title}](${siteUrl}/posts/${post.slug}/): ${post.data.description} (${date})`
    );
  }

  lines.push("", "## 추가 정보", "");
  lines.push(`- 전체 포스트 수: ${publishedPosts.length}`);
  lines.push(`- 언어: 한국어`);
  lines.push(`- RSS: ${siteUrl}/rss.xml`);
  lines.push(`- 상세 버전: ${siteUrl}/llms-full.txt`);
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
