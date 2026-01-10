# ywc.life

개발하면서 배운 것들을 정리하고, 유용한 라이브러리를 소개하는 개인 블로그입니다.

🌐 **Live**: [https://ywc.life](https://ywc.life)

## ✨ 주요 기능

- 📝 **MDX 기반 블로그** - Content Collections API로 타입 안전한 콘텐츠 관리
- 🎨 **미니멀 디자인** - 깔끔한 회색 톤 기반의 미니멀리스트 UI
- 🏷️ **카테고리 & 태그** - 체계적인 콘텐츠 분류 시스템
- 🔍 **SEO 최적화** - Sitemap, RSS, Open Graph, Twitter Card 지원
- 💬 **Giscus 댓글** - GitHub Discussions 기반 댓글 시스템
- 📊 **Vercel Analytics** - 실시간 트래픽 분석
- 🖼️ **이미지 최적화** - Sharp를 통한 자동 WebP 변환 및 반응형 이미지
- 📖 **목차(TOC)** - Intersection Observer를 활용한 현재 위치 자동 하이라이트
- 🚀 **빠른 성능** - 정적 사이트 생성으로 최적의 로딩 속도

## 🛠️ 기술 스택

- **Framework**: [Astro 5.x](https://astro.build)
- **UI Library**: [React 19.x](https://react.dev) (Islands Architecture)
- **Styling**: [TailwindCSS 4.x](https://tailwindcss.com)
- **Content**: MDX with Content Collections
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com)
- **Code Highlighting**: [Shiki](https://shiki.style)
- **Comments**: [Giscus](https://giscus.app)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics)
- **TypeScript**: 5.x with strict mode

## 🚀 시작하기

### 사전 요구사항

- Node.js 20 이상
- pnpm (권장)

### 설치

```bash
# 저장소 클론
git clone https://github.com/ywc0008/real-last-choijong-jjinmack-blog.git
cd real-last-choijong-jjinmack-blog

# 의존성 설치
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

http://localhost:4321 에서 개발 서버가 실행됩니다.

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 빌드 결과 미리보기
pnpm preview
```

### 코드 품질

```bash
# ESLint 실행
pnpm lint

# Prettier 포맷팅
pnpm format

# TypeScript 타입 체크
pnpm check
```

## 📁 프로젝트 구조

```text
/
├── public/              # 정적 파일 (robots.txt, favicon 등)
├── src/
│   ├── assets/         # 이미지 등 최적화가 필요한 에셋
│   │   └── posts/      # 블로그 포스트 이미지
│   ├── components/     # 재사용 가능한 컴포넌트
│   │   └── astro/      # Astro 컴포넌트
│   ├── content/        # 블로그 콘텐츠
│   │   ├── blog/       # MDX 포스트
│   │   ├── categories.json
│   │   └── config.ts   # Content Collections 스키마
│   ├── layouts/        # 레이아웃 컴포넌트
│   ├── pages/          # 페이지 라우팅
│   ├── styles/         # 글로벌 스타일
│   ├── types/          # TypeScript 타입 정의
│   └── utils/          # 유틸리티 함수
├── astro.config.mjs    # Astro 설정
├── tailwind.config.js  # TailwindCSS 설정
└── tsconfig.json       # TypeScript 설정
```

## ✍️ 블로그 포스트 작성하기

### 1. 새 MDX 파일 생성

`src/content/blog/` 디렉토리에 새 `.mdx` 파일을 생성합니다.

```bash
src/content/blog/my-new-post.mdx
```

### 2. Frontmatter 작성

```yaml
---
title: "포스트 제목"
description: "포스트 설명"
pubDate: 2026-01-11T12:00:00Z
updatedDate: 2026-01-12T10:00:00Z  # 선택사항
heroImage: ../../assets/posts/my-new-post/hero.jpg  # 선택사항
category: "Development"  # categories.json에 정의된 카테고리
tags: ["TypeScript", "React"]
draft: false
---
```

### 3. 콘텐츠 작성

Frontmatter 아래에 MDX 형식으로 콘텐츠를 작성합니다.

```mdx
## 소제목

본문 내용...

```typescript
// 코드 블록
const example = "Hello World";
```

더 많은 내용...
```

### 4. 이미지 추가 (선택사항)

```bash
src/assets/posts/my-new-post/
├── hero.jpg
└── screenshot.png
```

MDX 내에서 이미지 사용:

```mdx
![이미지 설명](../../assets/posts/my-new-post/screenshot.png)
```

## 💬 Giscus 댓글 설정

### 1. GitHub Discussions 활성화

1. 레포지토리 Settings → General → Features
2. **Discussions** 체크박스 활성화

### 2. Giscus 설정

1. https://giscus.app 방문
2. Repository: `ywc0008/real-last-choijong-jjinmack-blog` 입력
3. Category 선택 (예: "General")
4. 생성된 `data-repo-id`와 `data-category-id` 값 복사

### 3. Comments.astro 업데이트

`src/components/astro/Comments.astro` 파일의 4-7번째 줄 수정:

```typescript
const repoId = "R_kgDO..."; // 받은 값으로 교체
const categoryId = "DIC_kwDO..."; // 받은 값으로 교체
```

## 🚀 배포

### Vercel (권장)

1. GitHub 레포지토리를 Vercel에 연결
2. 빌드 설정은 자동으로 감지됨
3. 환경 변수 설정 불필요 (정적 사이트)

**중요**: `sharp` 패키지가 dependencies에 포함되어 있어야 이미지 최적화가 정상 작동합니다.

### 기타 플랫폼

정적 사이트 호스팅을 지원하는 모든 플랫폼에 배포 가능:

- Netlify
- Cloudflare Pages
- GitHub Pages

빌드 명령어: `pnpm build`
출력 디렉토리: `dist`

## 📝 개발 가이드

더 자세한 개발 가이드는 [`CLAUDE.md`](./CLAUDE.md)를 참고하세요.

- Content Collections 스키마
- 이미지 최적화 가이드
- URL 구조 규칙
- 스타일링 규칙
- 배포 체크리스트

## 📄 라이선스

MIT License
