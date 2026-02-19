import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import satori from "satori";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { generateOgTemplate } from "../../utils/og-template";

const fontBold = readFileSync(join(process.cwd(), "src/assets/fonts/PretendardBold.otf"));
const fontRegular = readFileSync(join(process.cwd(), "src/assets/fonts/PretendardRegular.otf"));

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("blog");
  return posts
    .filter((post) => !post.data.draft)
    .map((post) => ({
      params: { slug: post.slug },
      props: {
        title: post.data.title,
        category: post.data.category,
        pubDate: post.data.pubDate,
      },
    }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, category, pubDate } = props as {
    title: string;
    category: string;
    pubDate: Date;
  };

  const date = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(pubDate));

  const template = generateOgTemplate({ title, category, date });

  const svg = await satori(template, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Pretendard",
        data: fontBold,
        weight: 700,
        style: "normal",
      },
      {
        name: "Pretendard",
        data: fontRegular,
        weight: 400,
        style: "normal",
      },
    ],
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
