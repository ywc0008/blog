# Tasks: 개발자 블로그 핵심 기능

**Input**: Design documents from `/specs/001-blog-core/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: 이 프로젝트는 테스트가 명시적으로 요청되지 않았으므로 테스트 작업을 포함하지 않습니다.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `public/`, `.storybook/` at repository root
- Paths shown below assume single project structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Astro project with TypeScript strict mode
- [x] T002 Install core dependencies: @astrojs/react, @astrojs/mdx, @astrojs/sitemap, @astrojs/rss
- [x] T003 [P] Install React 19.x and React DOM
- [x] T004 [P] Configure TailwindCSS 4.x (already installed) with dark mode
- [x] T005 [P] Install ESLint and Prettier for linting and formatting
- [x] T006 Create project directory structure: src/{components/{react,astro},content/blog,layouts,pages,styles,types,utils}
- [x] T007 Create public/ directory for static assets
- [x] T008 Configure astro.config.mjs with integrations (React, MDX, Sitemap) and Shiki settings
- [x] T009 [P] Configure tsconfig.json for strict TypeScript mode
- [x] T010 [P] Configure tailwind.config.mjs with dark mode class strategy
- [x] T011 [P] Configure .eslintrc.cjs and .prettierrc for linting and formatting rules
- [x] T012 [P] Create .gitignore with Node.js, Astro, and IDE entries

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Define Content Collections schema in src/content/config.ts with BlogPost schema using TypeScript types (title, description, pubDate, updatedDate, heroImage, category, tags, draft)
- [x] T014 [P] Create TypeScript types in src/types/index.ts (BlogPost, Category, Tag, Theme, SearchIndexEntry, PostListProps, PostDetailProps, SEOProps)
- [x] T015 [P] Create BaseLayout component in src/layouts/BaseLayout.astro with dark mode SSR flicker prevention script
- [x] T016 [P] Create global CSS file in src/styles/global.css with TailwindCSS directives (@tailwind base/components/utilities)
- [x] T017 Create categories.json in src/content/ with initial categories (Performance, TypeScript, General)
- [x] T018 [P] Create utility functions in src/utils/post.ts (slugify, calculateReadingTime, sortPostsByDate)
- [x] T019 [P] Create theme utility in src/utils/theme.ts for theme detection and localStorage management

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 포스트 읽기 (Priority: P1) 🎯 MVP

**Goal**: 사용자가 포스트 목록을 보고, 포스트를 클릭하여 상세 내용을 읽고, 코드 하이라이팅을 확인하고, 댓글을 작성할 수 있음

**Independent Test**: 포스트 목록 페이지(`/`)를 열고 → 포스트 클릭 → 상세 페이지(`/posts/[slug]`) 이동 → 코드 하이라이팅 확인 → 목차(TOC) 클릭하여 스크롤 → 댓글 섹션(Giscus) 확인

### Implementation for User Story 1

- [ ] T020 [P] [US1] Create sample MDX posts in src/content/blog/ (hello-world.mdx, example-with-code.mdx)
- [ ] T021 [P] [US1] Create Card component in src/components/astro/Card.astro for displaying post previews
- [ ] T022 [P] [US1] Create Header component in src/components/astro/Header.astro with site logo and navigation
- [ ] T023 [P] [US1] Create Footer component in src/components/astro/Footer.astro with copyright and links
- [ ] T024 [US1] Create post list page in src/pages/index.astro (fetch posts with getCollection, filter drafts, sort by pubDate, render Card components)
- [ ] T025 [US1] Create dynamic post detail page in src/pages/posts/[slug].astro (getStaticPaths, render MDX content, display frontmatter)
- [ ] T026 [P] [US1] Create TOC (Table of Contents) component in src/components/astro/TOC.astro (extract headings from MDX, generate navigation links)
- [ ] T027 [US1] Integrate TOC into post detail page layout with smooth scroll behavior
- [ ] T028 [P] [US1] Create Comments component in src/components/astro/Comments.astro (Giscus script wrapper with data-theme attribute)
- [ ] T029 [US1] Add Comments component to post detail page footer
- [ ] T030 [US1] Add reading time calculation to post detail page (use calculateReadingTime utility)
- [ ] T031 [US1] Verify Shiki code highlighting works in MDX posts (test with TypeScript, JavaScript, Python code blocks)
- [ ] T032 [US1] Add responsive design to post list and detail pages using TailwindCSS

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (MVP complete!)

---

## Phase 4: User Story 2 - 포스트 검색 및 필터링 (Priority: P2)

**Goal**: 사용자가 Cmd+K로 검색 모달을 열고, 키워드로 포스트를 검색하고, 카테고리/태그로 필터링하고, 정렬할 수 있음

**Independent Test**: Cmd+K 입력 → SearchModal 열림 → 키워드 입력 → 실시간 검색 결과 표시 → 포스트 클릭하여 이동 / 카테고리 클릭 → 필터링된 목록 표시 / 정렬 옵션 선택 → 재정렬 확인

### Implementation for User Story 2

- [ ] T033 [P] [US2] Create search index API endpoint in src/pages/api/posts.json.ts (export GET function, fetch all non-draft posts, return JSON with slug/title/description/category/tags/pubDate)
- [ ] T034 [P] [US2] Create search utility in src/utils/search.ts (fuzzy search logic, filter by query, highlight matches)
- [ ] T035 [P] [US2] Create SearchModal component in src/components/react/SearchModal.tsx (fetch /api/posts.json, search input state, filtered results rendering)
- [ ] T036 [US2] Add keyboard listener for Cmd+K/Ctrl+K to open SearchModal (global event listener in BaseLayout)
- [ ] T037 [US2] Integrate SearchModal into BaseLayout with client:idle directive
- [ ] T038 [P] [US2] Create category filter page in src/pages/categories/[category].astro (getStaticPaths from categories.json, filter posts by category)
- [ ] T039 [P] [US2] Create tag filter page in src/pages/tags/[tag].astro (getStaticPaths from all tags, filter posts by tag)
- [ ] T040 [US2] Add category and tag links to Card component
- [ ] T041 [US2] Add sorting controls to post list page (latest/oldest toggle, update getCollection sort)
- [ ] T042 [US2] Add pagination to post list page (10 posts per page, page navigation)
- [ ] T043 [US2] Style SearchModal with TailwindCSS (modal overlay, search input, results list)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 읽기 환경 커스터마이징 (Priority: P3)

**Goal**: 사용자가 다크/라이트 모드를 전환하고, 설정이 localStorage에 저장되어 다음 방문 시에도 유지됨

**Independent Test**: 테마 토글 버튼 클릭 → 다크/라이트 모드 전환 확인 → 페이지 새로고침 → 선택한 테마 유지 확인 → 댓글 섹션 테마 동기화 확인

### Implementation for User Story 3

- [ ] T044 [P] [US3] Create ThemeToggle component in src/components/react/ThemeToggle.tsx (useState for theme, useEffect to read localStorage, toggleTheme function to update DOM and localStorage)
- [ ] T045 [US3] Integrate ThemeToggle into Header component with client:load directive
- [ ] T046 [US3] Add Giscus theme synchronization to ThemeToggle (postMessage to iframe on theme change)
- [ ] T047 [US3] Update Comments component to respect current theme (data-theme attribute from localStorage)
- [ ] T048 [US3] Test theme persistence across page navigations
- [ ] T049 [US3] Test system preference detection (prefers-color-scheme media query)
- [ ] T050 [US3] Style ThemeToggle button with TailwindCSS (sun/moon icons, hover states)

**Checkpoint**: All user stories 1, 2, 3 should now be independently functional

---

## Phase 6: User Story 4 - SEO 및 공유 (Priority: P2)

**Goal**: 블로그 포스트가 검색 엔진에서 잘 노출되고, 소셜 미디어 공유 시 적절한 미리보기가 표시되며, RSS 피드를 제공함

**Independent Test**: 검색 엔진 크롤러 시뮬레이터로 메타 태그 확인 → 소셜 미디어 공유 미리보기 도구로 OG 태그 확인 → /rss.xml 접속하여 RSS 피드 확인 → /sitemap.xml 접속하여 사이트맵 확인

### Implementation for User Story 4

- [ ] T051 [P] [US4] Create SEO component in src/components/astro/SEO.astro (meta tags, OG tags, Twitter Card, canonical URL)
- [ ] T052 [US4] Integrate SEO component into BaseLayout with props (title, description, image, type)
- [ ] T053 [US4] Add SEO metadata to post list page (site title, site description)
- [ ] T054 [US4] Add SEO metadata to post detail page (post title, post description, hero image)
- [ ] T055 [P] [US4] Create RSS feed endpoint in src/pages/rss.xml.ts (use @astrojs/rss, fetch latest 20 posts, generate RSS 2.0 XML)
- [ ] T056 [US4] Add RSS feed link to HTML head in BaseLayout
- [ ] T057 [US4] Add sitemap.xml generation via @astrojs/sitemap integration (already configured in astro.config.mjs)
- [ ] T058 [US4] Create robots.txt in public/ directory (allow all, sitemap URL)
- [ ] T059 [US4] Test Open Graph tags with Facebook Sharing Debugger or similar tool
- [ ] T060 [US4] Test Twitter Card with Twitter Card Validator

**Checkpoint**: All user stories should now be independently functional with full SEO support

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T061 [P] Create Button component in src/components/react/Button.tsx (generic button with onClick, variants for primary/secondary/ghost)
- [ ] T062 [P] Replace inline buttons with Button component across all pages
- [ ] T063 [P] Add error handling to SearchModal (display message when fetch fails)
- [ ] T064 [P] Add loading states to SearchModal (skeleton UI while fetching)
- [ ] T065 [P] Add empty state to post list page ("No posts yet" message)
- [ ] T066 [P] Add empty state to search results ("No results found" message)
- [ ] T067 [P] Optimize images with Astro Image component (WebP conversion, lazy loading, srcset)
- [ ] T068 [P] Add breadcrumb navigation to post detail page
- [ ] T069 [P] Add "Back to top" button to long posts
- [ ] T070 [P] Add social share buttons to post detail page (Twitter, Facebook, LinkedIn)
- [ ] T071 Run ESLint and Prettier across all files (npm run lint && npm run format)
- [ ] T072 Run TypeScript type checking (npm run astro check)
- [ ] T073 Run production build and verify no errors (npm run build)
- [ ] T074 Run Lighthouse audit on key pages (/, /posts/[slug]) and verify 95+ scores
- [ ] T075 Test all user stories end-to-end (manual testing)
- [ ] T076 Create quickstart documentation verification (follow quickstart.md steps to ensure accuracy)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Depends on User Story 1 for post list structure
  - User Story 3 (P3): Can start after Foundational - No dependencies on other stories
  - User Story 4 (P2): Can start after Foundational - Depends on User Story 1 for post pages
- **Polish (Phase 7)**: Depends on all user stories being feature-complete

### User Story Dependencies

- **User Story 1 (P1)**: 독립적 - 다른 스토리 의존성 없음
- **User Story 2 (P2)**: User Story 1에 약간 의존 (포스트 목록 구조 재사용), 하지만 독립적으로 테스트 가능
- **User Story 3 (P3)**: 독립적 - 다른 스토리 의존성 없음
- **User Story 4 (P2)**: User Story 1에 약간 의존 (포스트 페이지 존재 필요), 하지만 독립적으로 테스트 가능

### Within Each User Story

- **User Story 1**: Card/Header/Footer (병렬) → 포스트 목록 페이지 → 포스트 상세 페이지 → TOC → Comments
- **User Story 2**: SearchModal + search API (병렬) → 통합 → 카테고리/태그 페이지 (병렬) → 정렬/페이지네이션
- **User Story 3**: ThemeToggle → 통합 → Giscus 동기화 → 테스트
- **User Story 4**: SEO 컴포넌트 → 통합 → RSS/sitemap → robots.txt

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Stories 1 and 3 can start in parallel (독립적)
- Within each story, all tasks marked [P] can run in parallel
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch foundational components in parallel:
# Task T024: Card.astro
# Task T025: Header.astro
# Task T026: Footer.astro
# Task T029: TOC.astro
# Task T031: Comments.astro

# Then sequentially:
# Task T027: index.astro (uses Card, Header, Footer)
# Task T028: posts/[slug].astro (uses BaseLayout)
# Task T030: Integrate TOC into [slug].astro
# Task T032: Add Comments to [slug].astro
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**Result**: 포스트를 작성하고, 목록을 보고, 상세 페이지로 이동하고, 코드 하이라이팅을 확인하고, 댓글을 작성할 수 있는 완전한 블로그

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 3 (다크 모드) → Test independently → Deploy/Demo
4. Add User Story 2 (검색/필터링) → Test independently → Deploy/Demo
5. Add User Story 4 (SEO) → Test independently → Deploy/Demo
6. Add Polish tasks → Final deployment

**Note**: User Story 3 (다크 모드)는 User Story 2보다 독립적이므로 먼저 구현해도 됨

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 3 (다크 모드)
   - Developer C: User Story 4 (SEO, depends on US1 페이지 구조)
3. User Story 2 (검색) 추가 (US1 완료 후)
4. Polish tasks 병렬 처리

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- 총 작업 수: 76 tasks
  - Setup: 12 tasks (removed: @astrojs/tailwind, @tanstack/react-query, zod, .storybook)
  - Foundational: 7 tasks
  - User Story 1: 13 tasks
  - User Story 2: 11 tasks
  - User Story 3: 7 tasks
  - User Story 4: 10 tasks
  - Polish: 16 tasks (removed: Storybook configuration and stories)
