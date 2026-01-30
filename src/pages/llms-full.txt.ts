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
    "# ywc.life - 전체 콘텐츠 가이드",
    "",
    "> 개발하면서 배운 것들을 정리하고, 유용한 라이브러리를 소개하는 기술 블로그입니다.",
    "",
    "## 사이트 구조",
    "",
    `- 홈: ${siteUrl}/`,
    `- RSS: ${siteUrl}/rss.xml`,
    `- 사이트맵: ${siteUrl}/sitemap-index.xml`,
    "",
    "## 카테고리",
    "",
  ];

  for (const cat of categories) {
    const catPosts = publishedPosts.filter((p) => p.data.category === cat.name);
    lines.push(`### ${cat.name}`);
    lines.push("");
    lines.push(`${cat.description}`);
    lines.push(`URL: ${siteUrl}/categories/${cat.slug}/`);
    lines.push(`포스트 수: ${catPosts.length}`);
    lines.push("");
  }

  lines.push("## 전체 포스트 목록", "");

  for (const post of publishedPosts) {
    const date = post.data.pubDate.toISOString().split("T")[0];
    const updated = post.data.updatedDate
      ? ` (수정: ${post.data.updatedDate.toISOString().split("T")[0]})`
      : "";
    lines.push(`### ${post.data.title}`);
    lines.push("");
    lines.push(`- URL: ${siteUrl}/posts/${post.slug}/`);
    lines.push(`- 날짜: ${date}${updated}`);
    lines.push(`- 카테고리: ${post.data.category}`);
    lines.push(`- 태그: ${post.data.tags.join(", ")}`);
    lines.push(`- 설명: ${post.data.description}`);
    lines.push("");
  }

  lines.push("## 태그 목록", "");

  const tagMap = new Map<string, number>();
  publishedPosts.forEach((post) => {
    post.data.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  const sortedTags = Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);
  for (const [tag, count] of sortedTags) {
    lines.push(`- [${tag}](${siteUrl}/tags/${tag.toLowerCase()}/): ${count}개 포스트`);
  }

  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
