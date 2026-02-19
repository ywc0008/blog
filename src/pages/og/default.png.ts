import type { APIRoute } from "astro";
import satori from "satori";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { generateDefaultOgTemplate } from "../../utils/og-template";

const fontBold = readFileSync(join(process.cwd(), "src/assets/fonts/PretendardBold.otf"));
const fontRegular = readFileSync(join(process.cwd(), "src/assets/fonts/PretendardRegular.otf"));

export const GET: APIRoute = async () => {
  const template = generateDefaultOgTemplate({
    title: "ywc.life",
    description: "개발하면서 배운 것들을 정리하고, 유용한 라이브러리를 소개합니다.",
  });

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
