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

정확한 스키마는 `src/content/config.ts`(Zod)를 참조.

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
- **Interactive Components**: Use Intersection Observer API for scroll-based features (see TOC.astro, Comments.astro)

### URL Structure

- Posts: `/posts/[slug]`, 전체 목록 허브: `/posts`
- Categories: `/categories/[category]` (lowercase), 허브: `/categories`
- Tags: `/tags/[tag]` (lowercase), 허브: `/tags` (물리 시뮬레이션 버블)
- About: `/about`
- OG Images: `/og/[slug].png` (빌드 타임 자동 생성)
- Default OG: `/og/default.png` (홈/카테고리/태그 페이지용)
- RSS: `/rss.xml`
- LLMs.txt: `/llms.txt` (AI 크롤러용 사이트 요약)
- LLMs-full.txt: `/llms-full.txt` (AI 크롤러용 상세 콘텐츠 가이드)
- Sitemap: Auto-generated by @astrojs/sitemap (`/sitemap-index.xml`, `/sitemap-0.xml`)

**Trailing Slash 설정**: `trailingSlash: "never"` + `build.format: "file"`로 설정되어 모든 URL에서 trailing slash가 제거됩니다 (`/posts/luxon/` → `/posts/luxon`). Cloudflare Pages 배포 환경에서 일관된 URL을 보장하기 위한 설정입니다.

**CRITICAL**: Always use `post.slug` for URLs, NOT `post.id`

- `post.id` includes file extension (e.g., "Luxon.mdx")
- `post.slug` is URL-safe without extension (e.g., "luxon")
- Bad: `params: { slug: post.id }` → `/posts/Luxon.mdx/`
- Good: `params: { slug: post.slug }` → `/posts/luxon/`

### OG Image Auto-Generation

- **Stack**: satori (JSX → SVG) + sharp (SVG → PNG), 빌드 타임 생성
- **Endpoints**: `src/pages/og/[slug].png.ts` (포스트별), `src/pages/og/default.png.ts` (사이트 기본)
- **Template**: `src/utils/og-template.ts` — satori용 JSX-like 객체 (`{ type, props }` 구조, React 런타임 불필요)
- **Fonts**: `src/assets/fonts/PretendardBold.otf`, `PretendardRegular.otf` (빌드 전용, 클라이언트 전송 안 됨)
- **Design**: 1200x630px, 상단 파란 그라데이션 바 + 카테고리 뱃지 + 제목 + 푸터(ywc.life + 날짜)
- **Integration**: `[slug].astro`에서 `image={/og/${post.slug}.png}`, `SEO.astro`에서 fallback `/og/default.png`
- **Output**: `dist/og/luxon.png`, `dist/og/msw.png` 등 각 포스트별 PNG 파일

### Image Optimization

- **CRITICAL**: Sharp must be installed as a dependency (`pnpm add sharp`)
- **Astro Image Component**: Used in Card.astro and [slug].astro
- **Storage**: `src/assets/posts/[post-name]/` (NOT `public/`)
- **Type**: `heroImage: image().optional()` in Content Collections schema returns `ImageMetadata`
- **Auto-optimization**: JPG/PNG → WebP, responsive srcset, lazy loading
- **BlogPost Type**: `heroImage?: ImageMetadata` in `src/types/index.ts`
- **Cloudflare Deployment**: Without Sharp, builds will fail with MissingSharp error
- **Hero 이미지 LCP 최적화**: 포스트 상세의 hero `<Image>`는 `loading="eager"` + `fetchpriority="high"` 조합 사용 (LCP 대상)
- **목록 페이지 첫 카드 LCP 최적화**: `Card.astro`의 `priority` prop으로 제어. 목록 페이지(홈/posts/categories/tags)에선 `.map((post, i) => <Card post={post} priority={i === 0} />)` 패턴 필수. 첫 카드만 `eager + fetchpriority="high"`로, 나머지는 `lazy` 유지. 새 목록 페이지 추가 시 누락 주의

### Key Files

- `astro.config.mjs`: Site URL (https://ywc.life), integrations, Shiki config (github-dark theme), `trailingSlash: "never"` + `build.format: "file"`, sitemap `serialize`에서 MDX frontmatter 파싱으로 lastmod 주입
- `src/content/config.ts`: Content Collections schema with `image()` helper
- `src/content/categories.json`: Available categories (Development, Library, Projects, Performance, TypeScript)
- `src/types/index.ts`: TypeScript types including BlogPost with ImageMetadata
- `src/layouts/BaseLayout.astro`: Base HTML structure, SEO component, `noindex` prop pass-through
- `src/components/astro/SEO.astro`: SEO/GEO meta tags (OG, Twitter Card, JSON-LD BlogPosting/WebSite/BreadcrumbList/SearchAction, robots meta, `noindex` prop)
- `src/components/astro/Card.astro`: Blog post card with hero image, category, tags links
- `src/components/astro/Header.astro`: Navigation with Tags/About + Search
- `src/components/astro/Search.astro`: Pagefind search modal with ⌘K shortcut (is:inline script)
- `src/components/astro/Footer.astro`: Footer with RSS and GitHub links
- `src/components/astro/TOC.astro`: Table of contents with Intersection Observer for current section highlighting
- `src/components/astro/Mermaid.astro`: Mermaid 다이어그램 lazy loader (CDN에서 mermaid@11 로드, is:inline script)
- `src/components/astro/Comments.astro`: Giscus 댓글 (IntersectionObserver로 client.js lazy load, rootMargin 200px)
- `src/components/astro/RelatedPosts.astro`: 포스트 상세 하단 관련 글 3개 (같은 카테고리 + 태그 중복도 내림차순)
- `src/utils/post.ts`: 유틸리티 함수 (sortPostsByDate, calculateReadingTime, getPostsByCategory, getPostsByTag, getAllTags)
- `src/utils/og-template.ts`: OG 이미지 satori 템플릿 (generateOgTemplate, generateDefaultOgTemplate)
- `src/pages/og/[slug].png.ts`: 포스트별 OG 이미지 빌드 타임 생성 엔드포인트
- `src/pages/og/default.png.ts`: 사이트 기본 OG 이미지 엔드포인트
- `src/pages/posts/[slug].astro`: Post detail page with hero image display, TOC sidebar, related posts
- `src/pages/posts/index.astro`: 전체 포스트 목록 허브 (pubDate 내림차순)
- `src/pages/categories/index.astro`: 카테고리 허브 (카테고리별 포스트 수 표시)
- `src/pages/llms.txt.ts`: AI 크롤러용 사이트 요약 엔드포인트 (빌드 타임 생성)
- `src/pages/llms-full.txt.ts`: AI 크롤러용 상세 콘텐츠 가이드 (빌드 타임 생성)
- `src/pages/404.astro`: Custom 404 page with recent posts suggestions
- `public/_redirects`: Cloudflare Pages 301 리다이렉트 (이전 `/blog/*` URL, 대소문자 변형, 구 이미지 경로)
- `public/_headers`: Link 응답 헤더 (RFC 8288 — `rel="sitemap"`, `rel="alternate"`, `rel="describedby"`)
- `.nvmrc`: Node 20 for Cloudflare Pages deployment
- `wrangler.jsonc`: Cloudflare Pages configuration

### SEO & GEO (Generative Engine Optimization)

- **JSON-LD Schemas**: WebSite (with SearchAction), BlogPosting (with mainEntityOfPage, Organization publisher+logo), BreadcrumbList, ProfilePage (about 페이지용)
- **SEO.astro Props**: `title`, `description`, `image`, `type`, `breadcrumb`, `noindex`, `article` (with `section`, `wordCount`)
- **BaseLayout → SEO 전달**: breadcrumb, noindex, article.section, article.wordCount 포함
- **robots.txt**: AI 크롤러 13종 명시적 허용 (GPTBot, ClaudeBot, PerplexityBot 등)
- **naver-site-verification**: BaseLayout에 meta 태그 존재 (네이버 서치어드바이저 소유권 인증)
- **llms.txt**: Astro 엔드포인트로 빌드 타임에 자동 생성

자세한 패턴·규칙은 아래 **SEO Patterns** 섹션 참고.

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

**Lazy Load**: `giscus.app/client.js` 스크립트는 IntersectionObserver(rootMargin: 200px)로 댓글 섹션이 viewport 근접 시에만 로드. 초기 번들에서 제외되어 INP 개선.

## SEO Patterns

### URL 정규화 (Trailing Slash)

- Sitemap·canonical·RSS link 모두 **no trailing slash** 원칙으로 통일
- `context.site`는 URL 객체로 toString 시 trailing slash 포함 → 문자열 결합 시 `.toString().replace(/\/$/, "")` 필수
- RSS item link: `new URL(/posts/${slug}, siteURL).toString().replace(/\/$/, "")` 로 **미리 절대 URL 확정** (`@astrojs/rss`의 자동 결합이 slash를 덧붙일 수 있으므로)

### Sitemap lastmod 주입 (`astro.config.mjs`)

- `astro:content`는 config에서 import 불가(런타임 가상 모듈) → Node `fs`로 `src/content/blog/*.mdx` frontmatter 직접 파싱
- `sitemap({ serialize })` 콜백에서 slug 매칭:
  - 포스트 URL → pubDate/updatedDate 기반 `lastmod`, `priority: 0.9`
  - 허브/카테고리/태그 URL → `buildDate`, `priority: 0.7`
  - `changefreq: "weekly"` 전체 공통

### Thin Content 자동 처리

- `src/pages/tags/[tag].astro`에서 `noindex={sortedPosts.length < 2}` 전달
- 포스트 1개짜리 태그는 `<meta robots="noindex, follow">` 송출 → 검색에서 제외
- 나중에 해당 태그에 포스트가 2개 이상 되면 다음 빌드에서 자동으로 index 대상 복귀 (셀프힐링)

### BreadcrumbList JSON-LD

- **모든 동적 페이지**(`posts/[slug]`, `categories/[category]`, `tags/[tag]`, `about`)는 SEO.astro에 `breadcrumb` props 전달 필수
- Breadcrumb URL은 절대 URL(`https://ywc.life/...`) 사용
- 시각적 breadcrumb UI는 아직 없음 (JSON-LD만 송출)

### JSON-LD publisher (BlogPosting)

- **`@type: Person` 사용 금지**. 반드시 Organization + `logo: ImageObject` 구조
- Google 구조화 데이터 가이드 준수 (logo 필드가 Organization 전용)

### RSS Feed 구조

- `xmlns: { atom: "http://www.w3.org/2005/Atom" }`으로 atom 네임스페이스 선언
- `customData`에 `<atom:link rel="self">`, `<lastBuildDate>`, `<managingEditor>`, `<image>` 포함
- 아이템 link는 위 URL 정규화 규칙 준수

### Related Posts 알고리즘 (`RelatedPosts.astro`)

- 같은 `category` 포스트 필터 → 각 후보의 태그 중복도(겹치는 태그 수) 계산
- 정렬: `overlap` 내림차순 → 동률 시 `pubDate` 내림차순
- 상위 3개 반환, 현재 포스트는 제외

### Cloudflare 응답 헤더 & 리다이렉트

- `public/_headers`: 모든 경로에 Link 응답 헤더 (RFC 8288) — `rel="sitemap"`, `rel="alternate"` (RSS), `rel="describedby"` (llms.txt)
- `public/_redirects`: 301 리다이렉트
  - 이전 Next.js `/blog/*` → 현재 `/posts/*`
  - 대소문자 변형 (`/posts/Luxon` → `/posts/luxon`)
  - 구 이미지 경로 → 포스트 URL

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

- Giscus script loaded from `https://giscus.app/client.js` with `crossOrigin="anonymous"` (lazy via IntersectionObserver)
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
- **astro:content in astro.config.mjs**: `astro:content`는 Astro 런타임 가상 모듈. config 파일은 그 전에 로드되므로 `getCollection()` 호출 불가. 대안: Node `fs`로 MDX 파일 직접 읽기 (sitemap serialize 구현 참고)
- **@astrojs/rss 자동 URL 결합**: 상대 경로로 `link` 전달 시 라이브러리가 trailing slash를 덧붙일 수 있음. `new URL().toString().replace(/\/$/,"")` 로 **미리 절대 URL 확정** 필수
- **Prettier + MDX 코드 블록**: MDX 내 ` ```typescript ` 블록에서 독립적인 배열/객체 선언(예: `["users", "list"]`)을 작성하면 Prettier가 유효한 JS 표현식으로 해석하여 `["users"]["list"]`처럼 망가뜨린다. 이런 경우 언어 지정 없이 ` ``` `(plain)으로 작성한다.
- **Git Commits**:
  - Write commit messages in Korean (project convention)
  - DO NOT add "Co-Authored-By" to commit messages
  - Follow conventional commits format: `feat:`, `fix:`, `docs:`, `design:`, etc.

## Blog Post Writing Guide (요약)

블로그 포스트(MDX) 작성 시 핵심 원칙:

- **해요체 필수**: "~합니다" → "~해요" (합니다체 금지)
- **메타 담화 최소화**: "앞서 설명했듯이", "다음으로", "사실은" 등 불필요한 전환 문구 제거
- **첫 3문장 안에 핵심 가치 전달**: 배경 설명이 아닌 독자 가치부터
- **스캔 가독성**: 긴 단락 금지, 핵심은 **볼드**, 비교표·Mermaid 다이어그램 적극 활용
- **파일명에 검색 키워드**: URL 경로가 되므로 영어 대시(`nextjs-jwt-proxy-pattern`)

전체 가이드(문서 유형 4가지, 정보 구조 6원칙, 문장 다듬기 5원칙, 독자 유입 최적화)는 [docs/writing-guide.md](docs/writing-guide.md) 참고.

기존 포스트 참고: `nextjs-jwt-proxy-pattern.mdx`, `tanstack-query-keys.mdx`
