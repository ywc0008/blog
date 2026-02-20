# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Framework**: Astro 5.x (Static Site Generator)
- **UI**: React 19.x (Islands Architecture - minimal interactive components only)
- **Styling**: TailwindCSS 4.x (manual integration via @tailwindcss/vite, NO @astrojs/tailwind)
- **Content**: MDX with Content Collections API
- **Image Processing**: Sharp 0.34.x (REQUIRED for Astro Image optimization)
- **Code Highlighting**: Shiki (build-time)
- **Comments**: Giscus (GitHub Discussions)
- **Analytics**: Google Analytics (Partytown) + Cloudflare Web Analytics (auto-injected via proxy mode)
- **TypeScript**: 5.x with strict mode

## Commands

```bash
# Development
pnpm dev                 # Start dev server at localhost:4321
pnpm build              # Production build to ./dist/
pnpm preview            # Preview production build
pnpm preview:cf         # Cloudflare Pages local preview

# Code Quality
pnpm lint               # Run ESLint with auto-fix
pnpm format             # Format with Prettier
pnpm check              # TypeScript type checking (astro check)
```

**Important**: To save tokens, do NOT automatically run build/check/lint/format commands. Instead, ask the user to run these commands manually and report back when complete.

**Pre-commit Hook**: Husky + lint-staged가 설정되어 있어, 커밋 시 staged 파일에 ESLint와 Prettier가 자동 실행됩니다.

## Architecture

### Astro Islands Pattern

- **Astro Components** (`.astro`): Static components with 0 bytes JS by default
- **React Components** (`.tsx`): Only for interactive features that need state/events
- Use `client:load` or `client:idle` directives sparingly

### Component Classification Rules

- **React (.tsx)**: Components with useState, useEffect, onClick handlers
- **Astro (.astro)**: Everything else (layouts, static UI, wrappers)
- Current React components: None (all features implemented with Astro + vanilla JS)

### Content Management

- **Blog Posts**: `src/content/blog/*.mdx` - MDX files with frontmatter
- **Content Schema**: Defined in `src/content/config.ts` using Zod
- **Categories**: Defined in `src/content/categories.json` (Development, Library, Projects, Performance, TypeScript)
- **Category System**: Single category per post (broad classification) + multiple tags (specific topics)
- **Images**: Store in `src/assets/posts/[post-name]/` for Astro Image optimization
- **Access**: Use `getCollection("blog")` from `astro:content`
- **Mermaid 다이어그램**: MDX에서 ` ```mermaid ` 코드 블록 사용 시 클라이언트에서 자동 렌더링 (Mermaid.astro가 CDN에서 lazy load)

#### Mermaid 다이어그램 작성 시 주의사항

Mermaid v11 렌더링 시 특수 문자가 파싱 오류를 일으킨다. 다음을 **절대 사용하지 않는다**:

| 금지                               | 대체               | 예시                       |
| ---------------------------------- | ------------------ | -------------------------- |
| `\n` (줄바꿈)                      | `<br/>`            | `A["제목<br/>설명"]`       |
| 이모지 (`✅`, `❌`, `⛔`, `⏳`)    | 텍스트             | `"접근 가능"`              |
| 꺾쇠괄호 `<>`                      | 소괄호 `()`        | `(encrypted, HttpOnly)`    |
| 중괄호 `{}` (노드 레이블 내)       | 제거 또는 풀어쓰기 | `accessToken, user`        |
| 따옴표 중첩                        | 제거               | `accessToken: 새 토큰`     |
| `<br/>` in sequence diagram `Note` | 한 줄로 작성       | `Note over A: 설명 텍스트` |

#### Blog Post Frontmatter

```yaml
title: string
description: string
pubDate: Date (YYYY-MM-DDTHH:mm:ssZ format)
updatedDate?: Date (optional)
heroImage?: ImageMetadata (../../assets/posts/folder/image.jpg)
category: string (must match categories.json)
tags: string[]
draft: boolean
```

#### Creating New Blog Posts

1. Create MDX file in `src/content/blog/[post-name].mdx`
2. Add hero image (if any) to `src/assets/posts/[post-name]/`
3. Ensure `category` matches one from `src/content/categories.json`
4. Use lowercase for tags (consistency)
5. Set `draft: true` for unpublished posts
6. Use ISO 8601 format for dates: `2024-03-13T00:00:00Z`

### Styling Approach

- **NO embedded `<style>` tags or @apply directives**
- **Use inline TailwindCSS utility classes only**
- **Exception**: `src/styles/global.css` for MDX prose styles (`.prose h2`, `.prose p`, etc.) + Mermaid 다이어그램 스타일 (`.mermaid-diagram`)
- **NO dark mode**: All dark mode code has been removed
- **Design System**: Minimalist gray tones (gray-50 to gray-900) with blue accents only for categories (bg-blue-100, text-blue-800)
- **Interactive Components**: Use Intersection Observer API for scroll-based features (see TOC.astro)

### URL Structure

- Posts: `/posts/[slug]`
- Categories: `/categories/[category]` (lowercase)
- Tags: `/tags/[tag]` (lowercase)
- RSS: `/rss.xml`
- LLMs.txt: `/llms.txt` (AI 크롤러용 사이트 요약)
- LLMs-full.txt: `/llms-full.txt` (AI 크롤러용 상세 콘텐츠 가이드)
- Sitemap: Auto-generated by @astrojs/sitemap

**Trailing Slash 설정**: `trailingSlash: "never"` + `build.format: "file"`로 설정되어 모든 URL에서 trailing slash가 제거됩니다 (`/posts/luxon/` → `/posts/luxon`). Cloudflare Pages 배포 환경에서 일관된 URL을 보장하기 위한 설정입니다.

**CRITICAL**: Always use `post.slug` for URLs, NOT `post.id`

- `post.id` includes file extension (e.g., "Luxon.mdx")
- `post.slug` is URL-safe without extension (e.g., "luxon")
- Bad: `params: { slug: post.id }` → `/posts/Luxon.mdx/`
- Good: `params: { slug: post.slug }` → `/posts/luxon/`

### Image Optimization

- **CRITICAL**: Sharp must be installed as a dependency (`pnpm add sharp`)
- **Astro Image Component**: Used in Card.astro and [slug].astro
- **Storage**: `src/assets/posts/[post-name]/` (NOT `public/`)
- **Type**: `heroImage: image().optional()` in Content Collections schema returns `ImageMetadata`
- **Auto-optimization**: JPG/PNG → WebP, responsive srcset, lazy loading
- **BlogPost Type**: `heroImage?: ImageMetadata` in `src/types/index.ts`
- **Cloudflare Deployment**: Without Sharp, builds will fail with MissingSharp error

### Key Files

- `astro.config.mjs`: Site URL (https://ywc.life), integrations, Shiki config (github-dark theme), `trailingSlash: "never"` + `build.format: "file"`
- `src/content/config.ts`: Content Collections schema with `image()` helper
- `src/content/categories.json`: Available categories (Development, Library, Projects, Performance, TypeScript)
- `src/types/index.ts`: TypeScript types including BlogPost with ImageMetadata
- `src/layouts/BaseLayout.astro`: Base HTML structure, SEO component
- `src/components/astro/SEO.astro`: SEO/GEO meta tags (OG, Twitter Card, JSON-LD BlogPosting, BreadcrumbList, SearchAction)
- `src/components/astro/Card.astro`: Blog post card with hero image, category, tags links
- `src/components/astro/Header.astro`: Navigation with Development/Library categories + Search
- `src/components/astro/Search.astro`: Pagefind search modal with ⌘K shortcut (is:inline script)
- `src/components/astro/Footer.astro`: Footer with RSS and GitHub links
- `src/components/astro/TOC.astro`: Table of contents with Intersection Observer for current section highlighting
- `src/components/astro/Mermaid.astro`: Mermaid 다이어그램 lazy loader (CDN에서 mermaid@11 로드, is:inline script)
- `src/utils/post.ts`: 유틸리티 함수 (sortPostsByDate, calculateReadingTime, getPostsByCategory, getPostsByTag, getAllTags)
- `src/pages/posts/[slug].astro`: Post detail page with hero image display and TOC sidebar
- `src/pages/llms.txt.ts`: AI 크롤러용 사이트 요약 엔드포인트 (빌드 타임 생성)
- `src/pages/llms-full.txt.ts`: AI 크롤러용 상세 콘텐츠 가이드 (빌드 타임 생성)
- `src/pages/404.astro`: Custom 404 page with recent posts suggestions
- `.nvmrc`: Node 20 for Cloudflare Pages deployment
- `wrangler.jsonc`: Cloudflare Pages configuration

### SEO & GEO (Generative Engine Optimization)

- **JSON-LD Schemas**: WebSite (with SearchAction), BlogPosting (with mainEntityOfPage, publisher), BreadcrumbList
- **SEO.astro Props**: `title`, `description`, `image`, `type`, `breadcrumb`, `article` (with `section`, `wordCount`)
- **BaseLayout → SEO 전달**: breadcrumb, article.section, article.wordCount 포함
- **robots.txt**: AI 크롤러 13종 명시적 허용 (GPTBot, ClaudeBot, PerplexityBot 등)
- **llms.txt**: Astro 엔드포인트로 빌드 타임에 자동 생성
- **Trailing Slash 주의**: `context.site`는 URL 객체이므로 문자열 결합 시 `.toString().replace(/\/$/, "")` 필요

### Search (Pagefind)

- **Implementation**: `src/components/astro/Search.astro` with `is:inline` script
- **Build**: `astro build && pagefind --site dist` (package.json build script)
- **Keyboard Shortcut**: ⌘K (Mac) / Ctrl+K (Windows) to open search modal
- **Indexing**: Pagefind creates static search index at build time in `/pagefind/`
- **Testing**: Search only works in `pnpm preview` (not `pnpm dev`) because index is generated at build time

## Development Constraints

- **No SSR**: Static generation only (`astro build`)
- **Build-time processing**: MDX, Shiki, Pagefind, image optimization all at build time
- **No state management libraries**: Use Astro's built-in features
- **No dark mode**: Removed for simplicity
- **is:inline scripts**: Must use pure JavaScript (no TypeScript syntax like `as` casts)

## Deployment

### Cloudflare Pages

Project is configured for Cloudflare Pages deployment:

- **Site URL**: https://ywc.life (set in `astro.config.mjs`)
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Node.js Version**: 20 (set `NODE_VERSION=20` in environment variables)
- **CRITICAL**: Sharp must be in dependencies for image optimization to work

`wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "ywc-life-blog",
  "compatibility_date": "2026-01-18",
  "pages_build_output_dir": "./dist",
}
```

#### Cloudflare Dashboard Setup

1. **Create Pages Project**: Workers & Pages → Create → Pages → Connect to Git
2. **Select Repository**: `ywc0008/blog`
3. **Build Settings**: Framework preset `Astro`, Build command `pnpm build`, Output directory `dist`
4. **Environment Variables**: Set `NODE_VERSION=20`
5. **Custom Domain**: Custom domains → Set up a custom domain → `ywc.life`

#### Cloudflare Web Analytics

Web Analytics is **automatically injected** when DNS proxy mode (orange cloud 🟠) is enabled.
No code changes needed - Cloudflare injects the analytics script automatically.

To view analytics: Cloudflare Dashboard → Analytics & Logs → Web Analytics

### Giscus Configuration

Giscus comments are already configured in `src/components/astro/Comments.astro`:

```typescript
const repo = "ywc0008/blog";
const repoId = "R_kgDOQ1_i3A";
const category = "General";
const categoryId = "DIC_kwDOQ1_i3M4C0zIb";
```

These values are public and safe to commit. Comments are displayed via GitHub Discussions integration.

## Security

### XSS Protection

- Astro and React provide automatic XSS protection by default
- MDX content is safely rendered through Astro's Content Collections API
- All user-facing content is validated through Zod schemas in `src/content/config.ts`
- No unsafe HTML rendering patterns are used in this codebase

### External Links

- External links must include `rel="noopener noreferrer"` to prevent tabnabbing attacks
- Example pattern in `Footer.astro`:
  ```typescript
  target={link.href.startsWith("http") ? "_blank" : undefined}
  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
  ```

### Third-Party Scripts

- Giscus script loaded from `https://giscus.app/client.js` with `crossOrigin="anonymous"`
- Google Analytics integrated via Google Tag Manager with Partytown
- Cloudflare Web Analytics auto-injected via proxy mode (no manual script needed)
- No Subresource Integrity (SRI) hashes used (not provided by Giscus)

### Content Security

- All blog content stored in Git repository (version controlled)
- Draft posts filtered at build time via `draft: boolean` frontmatter field
- No runtime content injection or dynamic user input processing
- Static site generation eliminates SQL/command injection vectors

## Known Issues & Important Notes

- **Sharp Dependency**: MUST be installed for Astro Image. Cloudflare Pages builds fail without it (MissingSharp error)
- **Pagefind Dev Mode**: Search doesn't work in `pnpm dev` - use `pnpm build && pnpm preview` to test
- **is:inline Scripts**: Cannot use TypeScript syntax (no `as HTMLElement`, no type annotations)
- **Astro context.site Trailing Slash**: `context.site`는 `URL` 객체로 `toString()` 시 trailing slash 포함. 경로 결합 시 이중 슬래시(`//`) 발생 주의 → `.toString().replace(/\/$/, "")` 사용
- **Prettier + MDX 코드 블록**: MDX 내 ` ```typescript ` 블록에서 독립적인 배열/객체 선언(예: `["users", "list"]`)을 작성하면 Prettier가 유효한 JS 표현식으로 해석하여 `["users"]["list"]`처럼 망가뜨린다. 이런 경우 언어 지정 없이 ` ``` `(plain)으로 작성한다.
- **Git Commits**:
  - Write commit messages in Korean (project convention)
  - DO NOT add "Co-Authored-By" to commit messages
  - Follow conventional commits format: `feat:`, `fix:`, `docs:`, `design:`, etc.

## Blog Post Writing Guide (개발자 글쓰기 가이드)

블로그 포스트(MDX) 작성 시 아래 원칙을 따른다.

### 문체 규칙

- **해요체** 사용 (합니다체 금지): "~합니다" → "~해요", "~됩니다" → "~돼요", "~입니다" → "~이에요/예요"
- 코드 블록 내 주석은 문체 변환 대상이 아님
- 기존 포스트 참고: `nextjs-jwt-proxy-pattern.mdx`, `tanstack-query-keys.mdx`

(출처: [technical-writing.dev](https://technical-writing.dev))

### Step 1. 문서 유형 파악

포스트의 목적에 따라 구조가 달라진다. 이 블로그는 주로 학습 + 설명 유형이다.

| 유형                  | 독자의 목적                            | 핵심 구성 요소                                          |
| --------------------- | -------------------------------------- | ------------------------------------------------------- |
| **학습(Tutorial)**    | 새 기술을 처음 접해서 흐름을 알고 싶다 | 단계별 구성, 실행 가능한 코드, 막힘없는 진행            |
| **문제 해결(How-to)** | 특정 문제를 해결하고 싶다              | 명확한 문제 정의, 즉시 적용 가능한 해결책, 환경별 차이  |
| **참조(Reference)**   | 특정 API/기능을 빠르게 확인하고 싶다   | 일관된 구조(시그니처→매개변수→반환값→예제), 검색 용이성 |
| **설명(Explanation)** | 개념/원리를 깊이 이해하고 싶다         | 등장 배경과 해결하려는 문제, 시각 자료, 선행 지식 안내  |

### Step 2. 정보 구조 원칙

**1) 한 페이지에서 하나만 다루기**

- H4(`####`) 이상 깊어지면 문서 분리를 검토한다
- 하나의 포스트에 하나의 핵심 주제만 다룬다

**2) 가치를 먼저 제공하기**

- 기능 나열이 아닌, 독자가 얻을 가치를 먼저 전달한다
- Bad: "이 라이브러리는 다양한 설정 옵션을 제공합니다. 먼저 `connection_timeout`..."
- Good: "이 라이브러리를 사용하면 DB 연결 속도가 50% 빨라집니다."
- 부가적 정보(역사, 배경)는 핵심 내용 뒤에 배치한다

**3) 효과적인 제목 쓰기**

- 핵심 키워드를 포함한다 (Bad: `에러를 해결하는 방법은?` → Good: `NOT_FOUND_USER 에러를 해결하는 방법`)
- 제목 문체를 통일한다 (모두 "~하기" 또는 모두 명사형)
- 30자 이내로 간결하게, 평서문으로 작성한다

**4) 개요 빠트리지 않기**

- 제목 바로 아래에 "이 글을 읽으면 무엇을 할 수 있는지"를 명확히 전달한다
- Bad: "이 문서는 TypeScript의 유틸리티 타입을 소개합니다."
- Good: "유틸리티 타입을 활용하면 반복적인 타입 선언을 줄이고 유연하게 타입을 관리할 수 있습니다. 이 글에서는 Partial, Pick, Omit 등을 사용하여 객체 타입을 효과적으로 다루는 방법을 알아봅니다."

**5) 예측 가능하게 하기**

- 용어를 일관되게 사용한다 ("상태", "데이터", "값"을 혼용하지 않는다)
- 설명 → 코드 예제 순서를 유지한다 (코드 먼저, 설명 나중이 아님)
- 기본 개념 → 구체적 사용법 → 예제 → 심화 내용 순서로 배치한다

**6) 자세히 설명하기**

- 새 개념이 등장하면 반드시 정의/설명을 덧붙인다
- Bad: "이 서비스는 이벤트 소싱 방식을 사용해 상태를 관리합니다."
- Good: "이벤트 소싱(Event Sourcing) 방식을 사용해 상태를 관리합니다. 이벤트 소싱은 상태 변화를 일으킨 모든 이벤트를 순서대로 기록하는 방식입니다."

### Step 3. 문장 다듬기 원칙

**1) 주체를 분명하게**

- 도구/기술을 주어로 쓰지 않는다
- Bad: "이 라이브러리는 데이터베이스 초기화를 수행해요"
- Good: "이 명령어를 실행하면 데이터베이스를 초기화할 수 있어요"
- 수동태를 능동태로 바꾼다
- Bad: "변경 사항이 적용된 후 다시 빌드되어야 합니다"
- Good: "변경 사항을 적용한 후 다시 빌드하세요"

**2) 필요한 정보만 남기기**

- 한 문장에 하나의 생각만 담는다
- 메타 담화를 제거한다 ('앞서 설명했듯이', '다음으로', '사실은', '아시겠지만')

**3) 구체적으로 쓰기**

- 명사 대신 동사를 사용한다 (Bad: "코드 최적화 진행 후 배포 수행" → Good: "코드를 최적화한 후 배포하세요")
- 모호한 표현을 제거한다 (Bad: "영향을 받을 수도 있습니다" → Good: "기존 설정이 삭제됩니다")
- 구체적 수치를 사용한다 (Bad: "데이터가 많을 때 성능 저하" → Good: "10,000건 초과 시 응답 1초 이상")

**4) 자연스러운 한국어 쓰기**

- 불필요한 한자어/파생명사를 제거한다 (Bad: "삭제하는 작업을 수행합니다" → Good: "삭제합니다")
- 번역체를 한국어답게 고친다 (Bad: "~를 통해" → Good: "~로", Bad: "~에 대한" → Good: "~의")

**5) 일관되게 쓰기**

- 공식 기술 용어를 사용한다 (Bad: "K8" → Good: "쿠버네티스(Kubernetes)")
- 같은 개념은 하나의 단어로 통일한다
- 약어 첫 등장 시 풀어 쓴다: "SSR(Server-Side Rendering)"
- 외래어는 업계 관례를 따른다 (Bad: "프런트엔드" → Good: "프론트엔드")

### Step 4. 독자 유입과 가독성 최적화

(출처: [How to write a developer blog post](https://news.hada.io/topic?id=20053))

**1) 첫 3문장 안에 핵심 전달하기**

- 독자는 첫 3문장으로 "이 글이 나를 위한 것인가"를 판단한다
- 불필요한 배경 설명 없이 독자가 얻을 가치를 즉시 제시한다
- Bad: "JWT는 2015년에 RFC 7519로 표준화된 토큰 형식으로, 다양한 인증 시나리오에서..."
- Good: "액세스 토큰을 어디에 저장하느냐에 따라 SSR 가능 여부, UX, 보안이 결정됩니다."

**2) 대상 독자를 넓게 잡기**

- 특정 전문가만이 아닌 더 넓은 개발자층이 읽을 수 있도록 작성한다
- 전문 용어를 처음 사용할 때 간략히 설명하여 진입 장벽을 낮춘다
- 깊이를 유지하면서도 접근성을 높인다

**3) 스캔 가독성 설계하기**

- 헤딩과 이미지만 훑어봐도 글의 흐름을 파악할 수 있어야 한다
- 긴 텍스트 단락을 피하고, 핵심 문장은 **볼드**로 강조한다
- 비교표, 순서도, 다이어그램을 적극 활용하여 복잡한 내용을 단순화한다
- Mermaid 다이어그램으로 아키텍처와 흐름을 시각화한다

**4) 배포 채널을 미리 고려하기**

- 글 작성 전에 어디서 공유할지 계획한다 (SEO, 커뮤니티 등)
- 경쟁 글이 적은 신기술/새로운 관점의 주제가 유리하다
- 파일명(= URL 경로)에 검색 키워드를 포함한다 (예: `nextjs-jwt-proxy-pattern`)
