# Search API Contract

**Endpoint**: `/api/posts.json`
**Method**: GET
**Purpose**: 클라이언트 사이드 검색을 위한 포스트 메타데이터 제공

## Overview

정적 빌드 시 생성되는 JSON 파일. SearchModal 컴포넌트에서 React Query로 fetch하여 클라이언트 필터링에 사용합니다.

## Request

### HTTP Method
```
GET /api/posts.json
```

### Headers
None required (정적 파일)

### Query Parameters
None (정적 JSON 파일이므로 필터링은 클라이언트에서 수행)

## Response

### Success Response (200 OK)

**Content-Type**: `application/json`

**Schema**:
```typescript
interface SearchIndexEntry {
  slug: string;          // 포스트 URL slug
  title: string;         // 포스트 제목
  description: string;   // 포스트 요약
  category: string;      // 카테고리 slug
  tags: string[];        // 태그 배열
  pubDate: string;       // ISO 8601 형식 날짜
}

type SearchIndexResponse = SearchIndexEntry[];
```

**Example Response**:
```json
[
  {
    "slug": "astro-islands-performance",
    "title": "Astro Islands로 성능 최적화하기",
    "description": "Astro Islands 아키텍처를 사용하여 블로그 성능을 극대화한 경험을 공유합니다.",
    "category": "performance",
    "tags": ["Astro", "Performance", "Islands"],
    "pubDate": "2026-01-08T00:00:00.000Z"
  },
  {
    "slug": "typescript-5-features",
    "title": "TypeScript 5.x 새로운 기능",
    "description": "TypeScript 5.0에서 추가된 주요 기능을 살펴봅니다.",
    "category": "typescript",
    "tags": ["TypeScript", "Language"],
    "pubDate": "2026-01-07T00:00:00.000Z"
  }
]
```

### Field Constraints

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| slug | string | ✅ | unique, lowercase, alphanumeric + hyphens | URL-safe 식별자 |
| title | string | ✅ | 1-100자 | 포스트 제목 |
| description | string | ✅ | 10-300자 | SEO 및 검색용 요약 |
| category | string | ✅ | 존재하는 카테고리 slug | 카테고리 |
| tags | string[] | ✅ | 1-10개 항목 | 태그 목록 |
| pubDate | string | ✅ | ISO 8601 형식 | 게시일 |

### Error Responses

**404 Not Found**:
```json
{
  "error": "File not found",
  "message": "Search index not generated. Build the project first."
}
```

**500 Internal Server Error**:
빌드 시 JSON 생성 실패 (Astro 빌드 에러로 표시됨)

## Caching

### HTTP Headers
```
Cache-Control: public, max-age=31536000, immutable
```

**Rationale**: 정적 빌드 파일이므로 변경되지 않음. 새 빌드 시 파일명 변경 또는 CDN 캐시 무효화 필요.

### Client-Side Caching (React Query)

```typescript
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: async () => {
    const res = await fetch('/api/posts.json');
    return res.json() as SearchIndexEntry[];
  },
  staleTime: Infinity, // 영구 캐싱 (빌드 시 고정)
  cacheTime: 1000 * 60 * 60, // 1시간 메모리 보관
});
```

## Performance

### File Size Estimates

| Post Count | Estimated Size | Load Time (3G) |
|------------|----------------|----------------|
| 10         | ~1 KB          | < 10ms         |
| 100        | ~10 KB         | < 100ms        |
| 1,000      | ~100 KB        | ~500ms         |

**Target**: 100 포스트 기준 ~10KB, 로딩 < 100ms (Success Criteria SC-003: 검색 200ms 이내)

### Optimization

- **Minification**: Astro 빌드 시 자동 압축
- **Gzip/Brotli**: CDN에서 자동 적용 (~70% 크기 감소)
- **Lazy Loading**: SearchModal 열릴 때만 fetch (`client:idle`)

## Usage Example

### React Query in SearchModal

```typescript
// src/components/react/SearchModal.tsx
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

interface SearchIndexEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  pubDate: string;
}

export function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');

  const { data: posts, isLoading } = useQuery<SearchIndexEntry[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('/api/posts.json');
      if (!res.ok) throw new Error('Failed to load posts');
      return res.json();
    },
    staleTime: Infinity,
  });

  const filteredPosts = useMemo(() => {
    if (!posts || !query) return posts || [];

    const lowerQuery = query.toLowerCase();
    return posts.filter(post =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.description.toLowerCase().includes(lowerQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [posts, query]);

  if (!isOpen) return null;

  return (
    <div className="modal">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색..."
      />

      {isLoading ? (
        <div>로딩 중...</div>
      ) : (
        <ul>
          {filteredPosts.map(post => (
            <li key={post.slug}>
              <a href={`/posts/${post.slug}`}>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Generation Logic

### Astro Endpoint

```typescript
// src/pages/api/posts.json.ts
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // draft가 아닌 포스트만 포함
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  // 최신순 정렬
  const sortedPosts = posts.sort((a, b) =>
    b.data.pubDate.getTime() - a.data.pubDate.getTime()
  );

  // 검색 인덱스 생성
  const searchIndex = sortedPosts.map(post => ({
    slug: post.slug,
    title: post.data.title,
    description: post.data.description,
    category: post.data.category,
    tags: post.data.tags,
    pubDate: post.data.pubDate.toISOString(),
  }));

  return new Response(JSON.stringify(searchIndex), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
```

## Testing

### Unit Test (Vitest)

```typescript
// src/pages/api/posts.json.test.ts
import { describe, it, expect } from 'vitest';
import { GET } from './posts.json';

describe('/api/posts.json', () => {
  it('should return array of posts', async () => {
    const response = await GET({} as any);
    const data = await response.json();

    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('slug');
    expect(data[0]).toHaveProperty('title');
  });

  it('should exclude draft posts', async () => {
    const response = await GET({} as any);
    const data = await response.json();

    data.forEach(post => {
      // draft 필드가 없거나 false여야 함
      expect(post.draft).toBeUndefined();
    });
  });

  it('should sort posts by pubDate desc', async () => {
    const response = await GET({} as any);
    const data = await response.json();

    for (let i = 1; i < data.length; i++) {
      const prev = new Date(data[i - 1].pubDate);
      const curr = new Date(data[i].pubDate);
      expect(prev >= curr).toBe(true);
    }
  });
});
```

### Integration Test (Playwright)

```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test('search API returns valid JSON', async ({ page }) => {
  const response = await page.request.get('/api/posts.json');

  expect(response.ok()).toBeTruthy();
  expect(response.headers()['content-type']).toContain('application/json');

  const data = await response.json();
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);
});
```

## Versioning

### Breaking Changes

만약 스키마 변경이 필요하면:

1. **v2 엔드포인트 추가**: `/api/posts-v2.json`
2. **Backward Compatibility**: 기존 `/api/posts.json` 유지
3. **Deprecation Notice**: 문서에 경고 추가
4. **Migration Period**: 3개월 후 v1 제거

### Non-Breaking Changes

- **필드 추가**: 선택적 필드 추가는 Breaking Change 아님
- **정렬 변경**: 클라이언트에서 재정렬 가능하므로 허용

## Security

### XSS Prevention

- **HTML Escape**: JSON.stringify()가 자동 처리
- **Content-Type**: `application/json`으로 MIME type 명시

### Rate Limiting

정적 파일이므로 CDN에서 처리. 특별한 rate limiting 불필요.

## Monitoring

### Metrics

- **File Size**: 빌드 시 출력 확인 (목표: < 15KB for 100 posts)
- **Load Time**: Lighthouse CI에서 측정
- **Cache Hit Rate**: CDN 대시보드에서 확인

### Alerts

- **File Size > 50KB**: 경고 (빌드 시 체크)
- **Build Failure**: Astro 빌드 에러로 표시

## Summary

`/api/posts.json`은 정적 빌드 시 생성되는 검색 인덱스로, 클라이언트 사이드 검색 기능을 제공합니다. 타입 안전하고, 캐싱 최적화되어 있으며, 성능 목표(검색 200ms 이내)를 만족합니다.
