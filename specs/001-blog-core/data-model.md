# Data Model: 개발자 블로그 핵심 기능

**Date**: 2026-01-08
**Feature**: 001-blog-core
**Purpose**: Entity definitions and relationships for the blog system

## Overview

블로그는 파일 기반 콘텐츠 관리 시스템으로, MDX 파일을 Git 저장소에 저장하고 Astro Content Collections API로 타입 안전하게 쿼리합니다. 데이터베이스 없이 빌드 시점에 모든 콘텐츠를 정적 HTML로 변환합니다.

## Core Entities

### 1. BlogPost

블로그 글의 기본 단위. MDX 파일로 저장되며, frontmatter에 메타데이터를 포함합니다.

**Source**: `src/content/blog/*.mdx`

**Schema** (Zod):

```typescript
import { z } from "astro:content";

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(300, "Description must be 300 characters or less"),

  pubDate: z.date().or(z.string().transform((str) => new Date(str))),

  updatedDate: z
    .date()
    .or(z.string().transform((str) => new Date(str)))
    .optional(),

  heroImage: z.string().url("Hero image must be a valid URL").optional(),

  category: z.string().min(1, "Category is required"),

  tags: z
    .array(z.string())
    .min(1, "At least one tag is required")
    .max(10, "Maximum 10 tags allowed"),

  draft: z.boolean().default(false),

  author: z.string().default("Default Author"),

  readingTime: z.number().int().positive().optional(), // 자동 계산되므로 선택적
});
```

**Fields**:

| Field       | Type     | Required | Description                  | Validation                |
| ----------- | -------- | -------- | ---------------------------- | ------------------------- |
| title       | string   | ✅       | 포스트 제목                  | 1-100자                   |
| description | string   | ✅       | 포스트 요약 (SEO, OG 태그용) | 10-300자                  |
| pubDate     | Date     | ✅       | 최초 게시일                  | Valid date                |
| updatedDate | Date     | ❌       | 최종 수정일                  | Valid date, > pubDate     |
| heroImage   | string   | ❌       | 대표 이미지 URL              | Valid URL                 |
| category    | string   | ✅       | 카테고리 (1개만)             | 최소 1자                  |
| tags        | string[] | ✅       | 태그 목록                    | 1-10개                    |
| draft       | boolean  | ❌       | 초안 여부 (true면 빌드 제외) | Default: false            |
| author      | string   | ❌       | 작성자 이름                  | Default: 'Default Author' |
| readingTime | number   | ❌       | 예상 읽기 시간 (분)          | 자동 계산                 |

**Body**: MDX 마크다운 콘텐츠 (Shiki로 코드 하이라이팅 적용)

**Example**:

```mdx
---
title: "Astro Islands로 성능 최적화하기"
description: "Astro Islands 아키텍처를 사용하여 블로그 성능을 극대화한 경험을 공유합니다."
pubDate: 2026-01-08
category: "Performance"
tags: ["Astro", "Performance", "Islands"]
heroImage: "/images/astro-islands.webp"
---

# Astro Islands란?

Astro Islands는...

\`\`\`typescript
// 예제 코드
const greeting = "Hello, Astro!";
\`\`\`
```

**Computed Fields**:

- `slug`: 파일명에서 자동 생성 (`hello-world.mdx` → `hello-world`)
- `readingTime`: 본문 단어 수 기반 계산 (200 words/min)
- `excerpt`: description 또는 본문 첫 300자

**Indexing**:

- Primary: `slug` (unique)
- Sortable: `pubDate` (desc), `updatedDate` (desc)
- Filterable: `category`, `tags`, `draft`

---

### 2. Category

포스트를 주제별로 분류하는 상위 분류 체계. 정적으로 정의되며 파일로 관리됩니다.

**Source**: `src/content/categories.json`

**Schema**:

```typescript
interface Category {
  slug: string; // URL-safe identifier
  name: string; // 표시 이름
  description: string; // 카테고리 설명
  color?: string; // TailwindCSS 색상 (예: "blue-500")
}
```

**Example**:

```json
[
  {
    "slug": "performance",
    "name": "Performance",
    "description": "웹 성능 최적화 관련 글",
    "color": "blue-500"
  },
  {
    "slug": "typescript",
    "name": "TypeScript",
    "description": "TypeScript 활용 및 팁",
    "color": "blue-600"
  }
]
```

**Constraints**:

- `slug`는 unique, lowercase, alphanumeric + hyphens
- `name`은 1-30자
- `description`은 10-200자

**Relationship**:

- `BlogPost.category` → `Category.slug` (foreign key)
- One-to-many: 하나의 Category는 여러 BlogPost를 가질 수 있음

---

### 3. Tag

포스트의 세부 주제를 나타내는 키워드. BlogPost frontmatter에 직접 정의됩니다.

**Source**: `BlogPost.tags` 배열에서 동적 수집

**Schema**:

```typescript
interface Tag {
  name: string; // 태그 이름 (예: "React", "Astro")
  slug: string; // URL-safe identifier (자동 생성)
  count: number; // 이 태그를 사용하는 포스트 수 (빌드 시 계산)
}
```

**Generation**:

```typescript
// 빌드 시 모든 BlogPost에서 tags 수집
const allTags = posts.flatMap((post) => post.data.tags);
const uniqueTags = [...new Set(allTags)];
const tagsWithCount = uniqueTags.map((tag) => ({
  name: tag,
  slug: slugify(tag),
  count: posts.filter((p) => p.data.tags.includes(tag)).length,
}));
```

**Constraints**:

- `name`은 1-30자
- `slug`는 lowercase, alphanumeric + hyphens

**Relationship**:

- Many-to-many: BlogPost ↔ Tag (배열로 관리)

---

### 4. ThemePreference

사용자의 다크/라이트 모드 선호도. 클라이언트 사이드 localStorage에 저장됩니다.

**Source**: Browser `localStorage`

**Schema**:

```typescript
type Theme = "light" | "dark" | "auto";

interface ThemePreference {
  theme: Theme;
  lastUpdated: Date;
}
```

**Storage**:

```typescript
// localStorage key: 'theme'
const storedTheme = localStorage.getItem("theme") as Theme | null;
```

**Constraints**:

- `theme`: 'light', 'dark', 'auto' 중 하나
- Default: 'auto' (시스템 설정 따름)

**State Transitions**:

```
auto → light → dark → light → ...
```

---

### 5. SearchIndex

클라이언트 사이드 검색을 위한 포스트 메타데이터 인덱스. 빌드 시 JSON으로 생성됩니다.

**Source**: `/api/posts.json` (빌드 시 생성)

**Schema**:

```typescript
interface SearchIndexEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  pubDate: string; // ISO 8601 format
}

type SearchIndex = SearchIndexEntry[];
```

**Generation**:

```typescript
// src/pages/api/posts.json.ts
import { getCollection } from "astro:content";

export async function GET() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const searchIndex = posts.map((post) => ({
    slug: post.slug,
    title: post.data.title,
    description: post.data.description,
    category: post.data.category,
    tags: post.data.tags,
    pubDate: post.data.pubDate.toISOString(),
  }));

  return new Response(JSON.stringify(searchIndex), {
    headers: { "Content-Type": "application/json" },
  });
}
```

**Usage**: SearchModal 컴포넌트에서 React Query로 fetch하여 클라이언트 필터링

**Constraints**:

- 파일 크기: ~10KB (100 포스트 기준)
- 캐싱: `staleTime: Infinity` (빌드 시 고정)

---

## Entity Relationships

```
Category (1) ←--→ (N) BlogPost (N) ←--→ (N) Tag
                        ↓
                   SearchIndex (generated)

ThemePreference (독립적, 클라이언트 전용)
```

**Cardinality**:

- Category → BlogPost: One-to-Many
- BlogPost → Tag: Many-to-Many (배열)
- BlogPost → SearchIndex: One-to-One (빌드 시 생성)

---

## Data Flow

### 1. 콘텐츠 작성 플로우

```
[작성자] → MDX 파일 생성 → Git commit → CI/CD 빌드 트리거
                                            ↓
                                    Content Collections 검증
                                            ↓
                                    정적 HTML 생성 + SearchIndex JSON
                                            ↓
                                    CDN 배포
```

### 2. 포스트 읽기 플로우

```
[사용자] → 포스트 목록 페이지 요청 → CDN에서 정적 HTML 제공
             ↓                           (0 bytes JS)
        포스트 클릭
             ↓
    포스트 상세 페이지 요청 → CDN에서 정적 HTML + Shiki 하이라이팅
             ↓
    댓글 위젯 로드 (Giscus script) → GitHub Discussions API
```

### 3. 검색 플로우

```
[사용자] → Cmd+K → SearchModal 열림 (React hydrate)
                        ↓
                 /api/posts.json fetch (React Query)
                        ↓
                 클라이언트 필터링 (Fuse.js 또는 직접 구현)
                        ↓
                 결과 표시 (실시간)
```

### 4. 테마 전환 플로우

```
[사용자] → ThemeToggle 클릭 (React)
                ↓
         localStorage 업데이트
                ↓
         document.documentElement.classList 변경
                ↓
         Giscus iframe postMessage 전송
                ↓
         댓글 UI 테마 동기화
```

---

## Validation Rules

### BlogPost

1. **Title uniqueness**: 동일 제목 금지 (빌드 시 확인)
2. **Date consistency**: `updatedDate >= pubDate`
3. **Category existence**: `categories.json`에 정의된 카테고리만 허용
4. **Tag format**: lowercase, alphanumeric + hyphens, 공백 불가
5. **Draft filtering**: `draft: true`인 포스트는 프로덕션 빌드에서 제외

### Category

1. **Slug uniqueness**: 중복 불가
2. **Color validation**: Tailwind 색상 팔레트 범위 내

### Tag

1. **Auto-slugify**: 한글 태그 → URL-safe slug 자동 변환
2. **Case-insensitive**: "React"와 "react"는 동일 태그

---

## TypeScript Types

```typescript
// src/types/index.ts

import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export interface Category {
  slug: string;
  name: string;
  description: string;
  color?: string;
}

export interface Tag {
  name: string;
  slug: string;
  count: number;
}

export interface SearchIndexEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  pubDate: string;
}

export type Theme = "light" | "dark" | "auto";

export interface ThemePreference {
  theme: Theme;
  lastUpdated: Date;
}

export interface PostListProps {
  posts: BlogPost[];
  category?: string;
  tag?: string;
}

export interface PostDetailProps {
  post: BlogPost;
}

export interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
}
```

---

## Performance Considerations

### Indexing Strategy

- **빌드 시 생성**: 모든 포스트를 정렬/필터링하여 정적 페이지 생성
- **페이지네이션**: 10개/페이지 (헌법 성능 목표 LCP < 2.5s 유지)
- **검색 인덱스**: 제목, 설명, 태그만 포함 (~10KB)

### Caching

- **정적 HTML**: CDN 엣지 캐싱, 무제한 TTL
- **SearchIndex JSON**: `Cache-Control: public, max-age=31536000, immutable`
- **이미지**: WebP 변환 + lazy loading

### Scalability

- **100 포스트**: SearchIndex ~10KB, 빌드 시간 ~30초
- **1000 포스트**: SearchIndex ~100KB, 빌드 시간 ~5분 (예상)
- **Limit**: 파일 시스템 기반, ~10,000 포스트까지 실용적

---

## Migration & Versioning

### Schema Changes

Content Collections 스키마 변경 시:

1. `src/content/config.ts` 업데이트
2. 기존 MDX 파일 frontmatter 마이그레이션 스크립트 작성
3. 빌드 에러 확인 → 수정 → 재빌드

### Backward Compatibility

- `updatedDate`, `heroImage`, `readingTime`: 선택적 필드로 기존 포스트 호환
- `author`: Default 값 제공

---

## Summary

블로그 데이터 모델은 파일 기반, 타입 안전, 빌드타임 검증을 핵심으로 합니다. Astro Content Collections API로 MDX를 관리하며, 클라이언트 사이드는 최소화(검색, 테마만 상태 관리)합니다. 모든 엔티티가 명확한 검증 규칙과 TypeScript 타입을 가지며, 헌법의 성능 우선 원칙을 준수합니다.
