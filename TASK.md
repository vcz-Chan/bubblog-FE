# NEXT.js 메타데이터 주입 작업 계획

## 목표
- 페이지 SSR 단계에서 `generateMetadata`로 동적 메타데이터를 주입하고, 레이아웃에 Static Metadata를 정의하여 SEO/공유 미리보기 품질을 개선한다.

## 대상 및 범위
- 홈: `src/app/page.tsx`
- 블로그: `src/app/blog/[userId]/page.tsx`
- 포스트: `src/app/post/[postId]/page.tsx`
- 레이아웃: `src/app/layout.tsx`

## 작업 항목
1) CSR/SSR 분리
- 홈 페이지의 기존 CSR 로직을 `src/app/HomeClient.tsx`로 분리하고, `src/app/page.tsx`는 서버 컴포넌트로 전환.
- 블로그 페이지의 기존 CSR 로직을 `src/app/blog/[userId]/BlogPageClient.tsx`로 분리하고, `src/app/blog/[userId]/page.tsx`는 서버 컴포넌트로 전환.
- 포스트 페이지는 현재 CSR/SSR 분리(본문 SSR)가 되어 있으므로 구조 유지.

2) 페이지별 generateMetadata 구현
- 홈(`page.tsx`): 서비스 기본 메타(title/description/openGraph/twitter) 반환.
- 블로그(`blog/[userId]/page.tsx`): `getUserProfile(userId)`로 사용자 정보를 조회해 title/description/이미지 동적 구성.
- 포스트(`post/[postId]/page.tsx`): `getBlogById(postId)`로 글 정보를 조회해 title/description/썸네일 기반 메타 구성.
- 모든 페이지는 실패 시 안전한 기본 메타로 폴백.

3) 레이아웃 Static Metadata 강화
- `src/app/layout.tsx`의 `metadata`를 `title.template`/`title.default`/`openGraph`/`twitter`/`icons` 등으로 확장.
- 기본 OG/Twitter 이미지(`/logo.jpeg`) 설정 및 사이트 기본 설명 통일.

## 수용 기준
- 각 대상 페이지에서 메타태그가 의도한 값으로 서버 사이드 주입됨(OG/Twitter 포함).
- CSR 상호작용 및 페이지 기능은 기존과 동일하게 동작.
- 빌드/런/린트 정상.

## 변경 파일
- 추가: `src/app/HomeClient.tsx`, `src/app/blog/[userId]/BlogPageClient.tsx`
- 수정: `src/app/page.tsx`, `src/app/blog/[userId]/page.tsx`, `src/app/post/[postId]/page.tsx`, `src/app/layout.tsx`
