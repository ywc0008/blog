# Quickstart Guide: 개발자 블로그 핵심 기능

**Date**: 2026-01-08
**Feature**: 001-blog-core
**Purpose**: 빠른 시작 가이드 및 개발 환경 설정

## Overview

이 가이드는 Astro 5.x 기반 블로그 프로젝트를 로컬 환경에서 설정하고 첫 포스트를 작성하는 과정을 안내합니다. 약 10분 소요됩니다.

---

## Prerequisites

### Required

- **Node.js**: 20.x 이상 ([다운로드](https://nodejs.org/))
- **npm** 또는 **pnpm**: 최신 버전
- **Git**: 버전 관리용

### Optional

- **VS Code**: 권장 에디터
  - Extensions: Astro, TailwindCSS IntelliSense, Biome
- **GitHub 계정**: Giscus 댓글 설정용

### 환경 확인

```bash
node --version  # v20.0.0 이상
npm --version   # 10.0.0 이상
git --version   # 2.0.0 이상
```

---

## Quick Start (5 Minutes)

### 1. 프로젝트 초기화

```bash
# 새 Astro 프로젝트 생성
npm create astro@latest my-blog

# 프로젝트 디렉토리 이동
cd my-blog

# 의존성 설치
npm install
```

**선택 사항** (create astro 프롬프트):

- Template: `Empty` (최소 구성으로 시작)
- TypeScript: `Yes, strict`
- Git: `Yes`

### 2. 필수 패키지 설치

```bash
# Astro 통합
npm install @astrojs/react @astrojs/tailwind @astrojs/mdx @astrojs/sitemap @astrojs/rss

# React 및 React Query
npm install react@19 react-dom@19 @tanstack/react-query

# 유틸리티
npm install -D tailwindcss@4 biome

# Content Collections 타입
npm install zod
```

### 3. 설정 파일 생성

**astro.config.mjs**:

```javascript
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://yourblog.com", // 실제 도메인으로 변경
  integrations: [react(), tailwind(), mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      wrap: true,
    },
  },
});
```

**tsconfig.json**:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

**tailwind.config.mjs**:

```javascript
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**biome.json**:

```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

### 4. 프로젝트 구조 생성

```bash
mkdir -p src/{components/{react,astro},content/blog,layouts,pages/posts,styles,types,utils}
```

### 5. Content Collection 설정

**src/content/config.ts**:

```typescript
import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    heroImage: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
```

### 6. 첫 번째 포스트 작성

**src/content/blog/hello-world.mdx**:

```mdx
---
title: "Hello, World!"
description: "첫 번째 블로그 포스트입니다."
pubDate: 2026-01-08
category: "general"
tags: ["hello", "first-post"]
---

# Hello, World!

Astro 5.x 블로그에 오신 것을 환영합니다!

## 코드 예제

\`\`\`typescript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

이제 블로그를 시작할 준비가 되었습니다.
```

### 7. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:4321` 열기.

---

## Core Components Setup

### BaseLayout 컴포넌트

**src/layouts/BaseLayout.astro**:

```astro
---
interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>

    <script is:inline>
      // SSR 플리커 방지
      const theme =
        localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.classList.toggle("dark", theme === "dark");
    </script>

    <style is:global>
      @tailwind base;
      @tailwind components;
      @tailwind utilities;
    </style>
  </head>
  <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
    <slot />
  </body>
</html>
```

### 포스트 목록 페이지

**src/pages/index.astro**:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../layouts/BaseLayout.astro";

const posts = await getCollection("blog", ({ data }) => !data.draft);
const sortedPosts = posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
---

<BaseLayout title="블로그" description="개발자 블로그">
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">포스트 목록</h1>

    <div class="space-y-6">
      {
        sortedPosts.map((post) => (
          <article class="border-b pb-6">
            <a href={`/posts/${post.slug}`} class="group">
              <h2 class="text-2xl font-semibold group-hover:text-blue-600">{post.data.title}</h2>
              <p class="text-gray-600 dark:text-gray-400 mt-2">{post.data.description}</p>
              <time class="text-sm text-gray-500">
                {post.data.pubDate.toLocaleDateString("ko-KR")}
              </time>
            </a>
          </article>
        ))
      }
    </div>
  </main>
</BaseLayout>
```

### 포스트 상세 페이지

**src/pages/posts/[slug].astro**:

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "../../layouts/BaseLayout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<BaseLayout title={post.data.title} description={post.data.description}>
  <article class="container mx-auto px-4 py-8 max-w-3xl">
    <h1 class="text-4xl font-bold mb-4">{post.data.title}</h1>

    <div class="flex gap-2 mb-8">
      {
        post.data.tags.map((tag) => (
          <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-sm">{tag}</span>
        ))
      }
    </div>

    <div class="prose dark:prose-invert max-w-none">
      <Content />
    </div>
  </article>
</BaseLayout>
```

---

## ThemeToggle 컴포넌트

**src/components/react/ThemeToggle.tsx**:

```tsx
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) setTheme(stored);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="테마 전환"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
```

**BaseLayout.astro에 추가**:

```astro
---
import { ThemeToggle } from "../components/react/ThemeToggle";
---

<body>
  <header class="container mx-auto px-4 py-4 flex justify-between">
    <a href="/">블로그</a>
    <ThemeToggle client:load />
  </header>

  <slot />
</body>
```

---

## Testing the Blog

### 1. 포스트 목록 확인

```bash
npm run dev
```

`http://localhost:4321` 접속 → "Hello, World!" 포스트 표시 확인

### 2. 포스트 상세 확인

포스트 클릭 → 코드 하이라이팅 확인

### 3. 다크 모드 테스트

테마 토글 버튼 클릭 → 다크/라이트 모드 전환 확인

### 4. 빌드 테스트

```bash
npm run build
npm run preview
```

`http://localhost:4321` 접속 → 프로덕션 빌드 확인

---

## Next Steps

### 1. Giscus 댓글 설정

1. GitHub Discussion 활성화
2. [Giscus 설정](https://giscus.app)에서 repo 설정
3. `src/components/astro/Comments.astro` 생성 (research.md 참조)

### 2. 검색 기능 추가

1. SearchModal 컴포넌트 생성
2. `/api/posts.json` 엔드포인트 구현 (contracts/search-api.md 참조)
3. React Query 설정

### 3. SEO 최적화

1. `src/components/astro/SEO.astro` 생성 (research.md 참조)
2. BaseLayout에 SEO 컴포넌트 통합
3. RSS 피드 설정

### 4. Storybook 설정

```bash
npx storybook@latest init
```

React 컴포넌트 스토리 작성 (ThemeToggle, SearchModal 등)

---

## Common Commands

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린팅 & 포매팅
npx biome check --write ./src

# 타입 체크
npm run astro check

# Storybook
npm run storybook
```

---

## Troubleshooting

### 문제: "Cannot find module 'astro:content'"

**해결책**: `npm run dev` 실행하여 타입 생성

### 문제: Shiki 코드 하이라이팅 안 됨

**해결책**: `astro.config.mjs`에서 `shikiConfig` 확인

### 문제: Tailwind 스타일 안 보임

**해결책**:

1. `tailwind.config.mjs`의 `content` 경로 확인
2. BaseLayout에 `@tailwind` directives 포함 확인

### 문제: 다크 모드 플리커

**해결책**: BaseLayout의 `<script is:inline>` 위치 확인 (head 안)

---

## Resources

### Documentation

- [Astro Docs](https://docs.astro.build/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [React Query Docs](https://tanstack.com/query/latest)

### Project Files

- [research.md](./research.md): 기술 조사 및 구현 패턴
- [data-model.md](./data-model.md): 데이터 모델 및 타입 정의
- [contracts/search-api.md](./contracts/search-api.md): 검색 API 계약

---

## Summary

이제 Astro 5.x 블로그의 기본 구조가 완성되었습니다:

✅ Content Collections로 타입 안전한 포스트 관리
✅ Shiki 코드 하이라이팅 (빌드타임)
✅ 다크 모드 토글 (React)
✅ 반응형 디자인 (TailwindCSS)
✅ TypeScript 엄격 모드

다음은 검색, 댓글, SEO 기능을 추가하여 블로그를 완성하세요!
