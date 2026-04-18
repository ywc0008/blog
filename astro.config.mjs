// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readPostLastmodMap() {
  const postsDir = path.resolve(__dirname, "src/content/blog");
  const map = new Map();
  if (!fs.existsSync(postsDir)) return map;

  for (const file of fs.readdirSync(postsDir)) {
    if (!file.endsWith(".mdx")) continue;
    const slug = file.replace(/\.mdx$/, "").toLowerCase();
    const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const fm = raw.match(/^---\n([\s\S]*?)\n---/)?.[1];
    if (!fm) continue;
    if (/^draft:\s*true/m.test(fm)) continue;

    const pubDate = fm.match(/^pubDate:\s*["']?([^"'\n]+?)["']?\s*$/m)?.[1];
    const updatedDate = fm.match(/^updatedDate:\s*["']?([^"'\n]+?)["']?\s*$/m)?.[1];
    const dateStr = (updatedDate ?? pubDate)?.trim();
    if (!dateStr) continue;

    const parsed = new Date(dateStr);
    if (!Number.isNaN(parsed.getTime())) {
      map.set(slug, parsed.toISOString());
    }
  }
  return map;
}

const postLastmod = readPostLastmodMap();
const buildDate = new Date().toISOString();

// https://astro.build/config
export default defineConfig({
  site: "https://ywc.life",
  trailingSlash: "never",
  build: {
    format: "file",
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      serialize(item) {
        const match = item.url.match(/\/posts\/([^/]+)\/?$/);
        if (match) {
          const slug = match[1].toLowerCase();
          const date = postLastmod.get(slug);
          if (date) {
            item.lastmod = date;
            item.priority = 0.9;
          }
        } else {
          item.lastmod = buildDate;
        }
        return item;
      },
    }),
    partytown({
      config: {
        forward: ["dataLayer.push", "gtag"],
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      langs: [],
      wrap: true,
    },
  },
});
