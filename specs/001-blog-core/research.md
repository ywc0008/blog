# Research: 개발자 블로그 핵심 기능

**Date**: 2026-01-08
**Feature**: 001-blog-core
**Purpose**: Technical decisions and best practices research

## Overview

Astro 5.x 기반 정적 블로그 구축을 위한 기술 조사. 성능 우선 원칙에 따라 빌드타임 처리, 선택적 hydration, 0 bytes JavaScript 기본 전략을 채택합니다.

## 1. Astro 5.x Content Collections 패턴

### Decision
Astro Content Collections API를 사용하여 MDX 블로그 포스트를 타입 안전하게 관리합니다.

### Rationale
- **타입 안전성**: Zod 스키마로 frontmatter 검증 및 자동 타입 생성
- **성능**: 빌드 시점에 모든 콘텐츠 인덱싱 및 최적화
- **DX**: `getCollection()`, `getEntry()`로 간단한 쿼리
- **자동 정렬/필터링**: 날짜, 카테고리, 태그 기준 쿼리 지원

### Implementation
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
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

### Alternatives Considered
- **직접 파일 시스템 쿼리**: 타입 안전성 부족, 에러 prone
- **CMS (Contentful, Sanity)**: 개인 블로그에 과도, Git 기반 워크플로우 선호

## 2. Shiki 코드 하이라이팅 설정

### Decision
Shiki를 Astro 통합으로 사용하며, `github-light`/`github-dark` 테마를 적용합니다.

### Rationale
- **빌드타임 처리**: 런타임 JavaScript 불필요 (헌법 III 준수)
- **정확한 문법 강조**: VS Code와 동일한 TextMate 문법 사용
- **테마 일관성**: GitHub 스타일로 개발자 친화적
- **성능**: 클라이언트 사이드 파싱 없음

### Implementation
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,  // 긴 코드 라인 줄바꿈
    },
  },
});
```

### Alternatives Considered
- **Prism.js**: 런타임 처리 필요 (헌법 위반)
- **Highlight.js**: 런타임 처리 필요 (헌법 위반)
- **Rehype Pretty Code**: Shiki 기반이지만 추가 설정 복잡도

## 3. Giscus 댓글 통합

### Decision
Astro 컴포넌트로 Giscus script를 래핑하고, `data-theme` 속성을 동적으로 설정합니다.

### Rationale
- **React 불필요**: `<script>` 태그만으로 작동 (헌법 II, III 준수)
- **테마 동기화**: localStorage에서 현재 테마 읽어 댓글 UI 일치
- **GitHub 통합**: 개발자 대상 블로그에 적합, 별도 백엔드 불필요

### Implementation
```astro
---
// src/components/astro/Comments.astro
---

<div class="giscus"></div>

<script is:inline>
  const theme = localStorage.getItem('theme') || 'preferred_color_scheme';
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.setAttribute('data-repo', '[REPO]');
  script.setAttribute('data-repo-id', '[REPO_ID]');
  script.setAttribute('data-category', '[CATEGORY]');
  script.setAttribute('data-category-id', '[CATEGORY_ID]');
  script.setAttribute('data-mapping', 'pathname');
  script.setAttribute('data-reactions-enabled', '1');
  script.setAttribute('data-emit-metadata', '0');
  script.setAttribute('data-theme', theme);
  script.setAttribute('data-lang', 'ko');
  script.setAttribute('crossorigin', 'anonymous');
  script.async = true;

  document.querySelector('.giscus').appendChild(script);
</script>
```

### Alternatives Considered
- **Utterances**: GitHub Issues 기반, Discussions보다 제한적
- **Disqus**: 광고, 추적 스크립트, 무거움
- **자체 댓글 시스템**: 헌법 명시적 금지

## 4. React Query 사용 전략

### Decision
검색 모달(SearchModal)에서만 React Query를 사용하여 포스트 메타데이터를 클라이언트에서 필터링합니다.

### Rationale
- **빌드타임 우선**: 대부분의 데이터는 Astro `getCollection()`으로 빌드 시점 처리
- **검색 UX**: 실시간 검색 피드백을 위해 클라이언트 사이드 필요
- **최소 사용**: 헌법 VI의 "대부분 빌드타임" 원칙 준수

### Implementation
```typescript
// src/components/react/SearchModal.tsx
import { useQuery } from '@tanstack/react-query';

export function SearchModal() {
  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/posts.json');
      return res.json();
    },
    staleTime: Infinity, // 빌드 시점 데이터는 변경 없음
  });

  // 검색 로직...
}
```

```astro
---
// src/pages/api/posts.json.ts
import { getCollection } from 'astro:content';

export async function GET() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const searchData = posts.map(post => ({
    slug: post.slug,
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags,
  }));

  return new Response(JSON.stringify(searchData), {
    headers: { 'Content-Type': 'application/json' },
  });
}
---
```

### Alternatives Considered
- **모든 데이터에 React Query**: 불필요한 클라이언트 사이드 처리 (헌법 위반)
- **검색도 빌드타임**: UX 저하 (페이지 이동 필요)
- **Algolia/Meilisearch**: 개인 블로그에 과도, 비용 발생

## 5. 다크 모드 구현

### Decision
ThemeToggle React 컴포넌트로 테마 상태 관리, localStorage 저장, CSS 변수 업데이트.

### Rationale
- **상태 필요**: React 사용 정당화 (헌법 II 준수)
- **SSR 플리커 방지**: Inline script로 초기 테마 설정
- **Tailwind 통합**: `dark:` 클래스로 스타일 제어
- **Giscus 동기화**: 댓글 테마 자동 업데이트

### Implementation
```astro
---
// src/layouts/BaseLayout.astro
---
<!DOCTYPE html>
<html lang="ko">
<head>
  <script is:inline>
    // SSR 플리커 방지
    const theme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  </script>
</head>
<body>
  <ThemeToggle client:load />
</body>
</html>
```

```tsx
// src/components/react/ThemeToggle.tsx
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark';
    setTheme(stored || 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');

    // Giscus 테마 업데이트
    const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
    if (iframe) {
      iframe.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: newTheme } } },
        'https://giscus.app'
      );
    }
  };

  return (
    <button onClick={toggleTheme} aria-label="테마 전환">
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### Alternatives Considered
- **CSS만 사용**: 토글 버튼에 상태 필요 (React 필수)
- **Vanilla JS**: 가능하지만 React로 Storybook 테스트 용이

## 6. SEO 및 RSS 구현

### Decision
Astro 빌트인 기능과 `@astrojs/sitemap`, `@astrojs/rss` 통합 사용.

### Rationale
- **빌드타임 생성**: sitemap.xml, rss.xml 정적 생성
- **메타 태그**: Astro 컴포넌트로 동적 생성
- **표준 준수**: RSS 2.0, Sitemap 프로토콜

### Implementation
```astro
---
// src/components/astro/SEO.astro
interface Props {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
}

const { title, description, image, type = 'website' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />

<!-- Open Graph -->
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:type" content={type} />
{image && <meta property="og:image" content={new URL(image, Astro.site)} />}

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
{image && <meta name="twitter:image" content={new URL(image, Astro.site)} />}
```

```javascript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yourblog.com',
  integrations: [sitemap()],
});
```

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return rss({
    title: '블로그 제목',
    description: '블로그 설명',
    site: context.site,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/posts/${post.slug}/`,
    })),
  });
}
```

### Alternatives Considered
- **수동 sitemap 생성**: 에러 prone, 유지보수 어려움
- **외부 SEO 서비스**: 불필요한 의존성

## 7. 이미지 최적화

### Decision
Astro Image 컴포넌트 사용, WebP/AVIF 자동 변환, 지연 로딩.

### Rationale
- **빌드타임 최적화**: 이미지 리사이징, 포맷 변환 (헌법 III)
- **반응형**: srcset 자동 생성
- **지연 로딩**: `loading="lazy"` 기본값
- **성능**: LCP, CLS 목표 달성

### Implementation
```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<Image
  src={heroImage}
  alt="설명"
  width={800}
  height={600}
  loading="lazy"
  format="webp"
/>
```

### Alternatives Considered
- **직접 `<img>` 사용**: 최적화 없음, 성능 저하
- **Sharp 수동 통합**: Astro가 내장 제공

## 8. Testing 전략

### Decision
- **Component**: Storybook + Storybook Test Runner
- **Unit**: Vitest
- **E2E**: Playwright

### Rationale
- **Storybook**: React 컴포넌트 격리 테스트, 시각적 회귀 테스트
- **Vitest**: Vite 기반, Astro와 호환성 우수
- **Playwright**: 크로스 브라우저 E2E, Lighthouse CI 통합 가능

### Implementation
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:4321',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
});
```

### Alternatives Considered
- **Jest**: Vitest가 더 빠르고 Vite 네이티브
- **Cypress**: Playwright가 더 빠르고 안정적

## 9. TailwindCSS 4.x 설정

### Decision
TailwindCSS 4.x 사용, 다크 모드 `class` 전략, JIT 모드.

### Rationale
- **성능**: JIT로 사용된 클래스만 생성
- **다크 모드**: `dark:` 접두사로 간단한 테마 전환
- **DX**: 유틸리티 우선 접근으로 빠른 개발

### Implementation
```javascript
// tailwind.config.mjs
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### Alternatives Considered
- **CSS Modules**: Tailwind가 더 빠르고 일관성
- **Styled Components**: SSG에 부적합, 런타임 비용

## 10. Biome 린팅/포매팅

### Decision
Biome를 ESLint + Prettier 대체로 사용.

### Rationale
- **성능**: Rust 기반, 10-100배 빠름
- **통합**: 린팅 + 포매팅 단일 도구
- **설정 간소화**: `.biome.json` 하나로 관리

### Implementation
```json
// biome.json
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

### Alternatives Considered
- **ESLint + Prettier**: 느림, 설정 복잡
- **dprint**: Biome가 더 성숙

## Summary

모든 기술 결정이 헌법 원칙을 준수하며, 성능 우선(빌드타임 처리), 컴포넌트 분류 규칙(상태 기반), TypeScript 타입 안정성을 만족합니다. Astro 5.x 생태계의 모범 사례를 따르며, 개인 블로그 규모에 적합한 단순하고 효율적인 아키텍처입니다.
