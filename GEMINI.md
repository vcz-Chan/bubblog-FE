# GEMINI.md (Korean)

## 프로젝트 개요

이 프로젝트는 "bubblog"라는 Next.js 기반의 블로그 플랫폼입니다. 사용자는 게시물을 작성, 조회, 수정, 삭제할 수 있습니다. TypeScript, Tailwind CSS로 구축되었으며, 데이터 페칭을 위해 커스텀 API를 사용합니다. 또한 사용자 인증, S3 이미지 업로드, 리치 텍스트 에디터 등의 기능을 포함하고 있습니다.

**주요 기술:**

*   **프레임워크:** Next.js
*   **언어:** TypeScript
*   **스타일링:** Tailwind CSS
*   **상태 관리:** Zustand
*   **API 통신:** `fetch`를 사용한 커스텀 API 클라이언트
*   **배포:** Vercel

## 빌드 및 실행

개발 환경을 실행하려면 다음 명령어를 사용하세요:

```bash
npm run dev
```

이 명령어는 `http://localhost:3000`에서 개발 서버를 시작합니다.

기타 스크립트:

*   `npm run build`: 프로덕션용으로 애플리케이션을 빌드합니다.
*   `npm run start`: 프로덕션 서버를 시작합니다.
*   `npm run lint`: 코드베이스의 오류를 검사합니다.

## 개발 컨벤션

*   **코드 스타일:** ESLint를 사용하여 일관된 코드 스타일을 유지합니다. `npm run lint`로 린팅 오류를 확인할 수 있습니다.
*   **컴포넌트 구조:** 컴포넌트는 `src/components` 디렉토리 아래에 기능별로 구성됩니다.
*   **API 통신:** 모든 API 요청은 `src/apis` 디렉토리에서 처리됩니다. `apiClient.ts` 파일은 인증 및 비인증 요청을 중앙에서 처리하는 방법을 제공합니다.
*   **상태 관리:** 전역 상태 관리를 위해 Zustand를 사용합니다. `src/store` 디렉토리에 Zustand 스토어가 있습니다.
*   **스타일링:** Tailwind CSS를 사용하여 스타일링합니다. 커스텀 CSS보다는 유틸리티 클래스를 사용하는 것을 선호합니다.
*   **타입:** TypeScript 타입은 `src/utils/types.ts` 파일에 정의되어 있습니다.

---

## API 문서

### `aiApi.ts`

AI 챗봇 관련 API 함수를 정의합니다.

*   **`askChatAPI(question, userId, categoryId, personaId, onContext, onAnswerChunk)`**: AI 서버에 질문을 보내고 SSE 스트림을 처리합니다.
    *   `question` (string): 사용자 질문
    *   `userId` (string): 사용자 ID
    *   `categoryId` (number | null): 카테고리 ID
    *   `personaId` (number | -1): 페르소나 ID
    *   `onContext` (function): 컨텍스트 아이템을 처리하는 콜백 함수
    *   `onAnswerChunk` (function): 답변 청크를 처리하는 콜백 함수
    *   **인증:** 필요 (JWT)

### `apiClient.ts`

API 서버와 통신하기 위한 클라이언트를 정의합니다.

*   **`apiClientNoAuth(path, options)`**: JWT 인증 없이 API 서버에 요청을 보냅니다.
*   **`apiClientWithAuth(path, options)`**: JWT 인증을 포함하여 API 서버에 요청을 보냅니다. 토큰 만료 시 자동으로 재발급을 시도합니다.
*   **`aiFetch(path, options)`**: AI 서버에 JWT 인증을 포함하여 요청을 보냅니다. SSE 통신을 위해 `Response` 객체를 직접 반환합니다.

### `authApi.ts`

사용자 인증 관련 API 함수를 정의합니다.

*   **`signup(payload)`**: 회원가입을 요청합니다.
    *   **인증:** 불필요
*   **`login(payload)`**: 로그인을 요청합니다.
    *   **인증:** 불필요
*   **`reissueToken()`**: 리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.
    *   **인증:** 불필요 (쿠키 기반)
*   **`logout()`**: 로그아웃을 요청합니다.
    *   **인증:** 필요 (JWT)

### `blogApi.ts`

블로그 게시물 관련 API 함수를 정의합니다.

*   **`getBlogsPage(page, size, sort)`**: 게시물 목록을 페이지네이션하여 조회합니다.
    *   **인증:** 불필요
*   **`getBlogs(page, size, sort)`**: 게시물 목록을 조회합니다.
    *   **인증:** 불필요
*   **`getBlogById(id)`**: 특정 ID의 게시물을 조회합니다.
    *   **인증:** 불필요
*   **`createBlog(payload)`**: 새로운 게시물을 작성합니다.
    *   **인증:** 필요 (JWT)
*   **`updateBlog(id, payload)`**: 기존 게시물을 수정합니다.
    *   **인증:** 필요 (JWT)
*   **`deleteBlog(id)`**: 게시물을 삭제합니다.
    *   **인증:** 필요 (JWT)
*   **`getPostsByUserPage(userId, page, size, sort, categoryId)`**: 특정 사용자의 게시물 목록을 페이지네이션하여 조회합니다.
    *   **인증:** 필요 (JWT)
*   **`getPostsByUserContent(userId, page, size, sort, categoryId)`**: 특정 사용자의 게시물 목록을 조회합니다.
    *   **인증:** 필요 (JWT)
*   **`putPostView(postId)`**: 게시물 조회수를 1 증가시킵니다.
    *   **인증:** 필요 (JWT)
*   **`putPostLike(postId)`**: 게시물 좋아요 수를 1 증가시킵니다.
    *   **인증:** 필요 (JWT)

### `categoryApi.ts`

카테고리 관련 API 함수를 정의합니다.

*   **`getCategoryTree(userId)`**: 특정 사용자의 카테고리 트리를 조회합니다.
    *   **인증:** 필요 (JWT)
*   **`createCategory(payload)`**: 새로운 카테고리를 생성합니다.
    *   **인증:** 필요 (JWT)
*   **`updateCategory(id, payload)`**: 기존 카테고리를 수정합니다.
    *   **인증:** 필요 (JWT)
*   **`deleteCategory(id)`**: 카테고리를 삭제합니다.
    *   **인증:** 필요 (JWT)

### `personaApi.ts`

페르소나 관련 API 함수를 정의합니다.

*   **`getPersonasByUser(userId)`**: 특정 사용자의 페르소나 목록을 조회합니다.
    *   **인증:** 필요 (JWT)
*   **`createPersona(params)`**: 새로운 페르소나를 생성합니다.
    *   **인증:** 필요 (JWT)
*   **`updatePersona(personaId, params)`**: 기존 페르소나를 수정합니다.
    *   **인증:** 필요 (JWT)
*   **`deletePersona(personaId)`**: 페르소나를 삭제합니다.
    *   **인증:** 필요 (JWT)

### `uploadApi.ts`

파일 업로드 관련 API 함수를 정의합니다.

*   **`getPresignedUrl(fileName, contentType)`**: S3에 업로드하기 위한 presigned URL을 발급받습니다.
    *   **인증:** 필요 (JWT)
*   **`uploadToS3(presignedUrl, file)`**: 발급받은 presigned URL을 사용하여 S3에 파일을 업로드합니다.
    *   **인증:** 불필요 (presigned URL에 인증 정보 포함)

### `userApi.ts`

사용자 정보 관련 API 함수를 정의합니다.

*   **`getUserProfile(userId)`**: 특정 사용자의 공개 프로필을 조회합니다.
    *   **인증:** 불필요
*   **`updateUserProfile(params)`**: 내 정보를 수정합니다.
    *   **인증:** 필요 (JWT)
*   **`deleteUserAccount()`**: 내 계정을 삭제합니다.
    *   **인증:** 필요 (JWT)