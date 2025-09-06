## Bubblog 리팩토링 계획

### 1. API 로직 개선

- **일관성 있는 에러 핸들링**: 현재 API 함수(`src/apis/*.ts`)들의 에러 처리 방식이 통일되어 있지 않습니다. `try...catch`와 `Promise` 반환을 혼용하는 대신, `apiClient` 단에서 에러를 일관되게 처리하고, 사용하는 쪽에서는 `try...catch`로만 처리하도록 통일합니다.
- **중복 로직 제거**: `blogApi.ts`의 `getBlogs`와 `getBlogsPage`처럼 페이지 데이터에서 `content`만 추출하는 중복 함수들을 제거하고, 컴포넌트에서 직접 `getBlogsPage`의 결과를 사용하도록 변경합니다. (`getPostsByUserPage`도 동일)

### 2. 컴포넌트 상태 관리 개선

- **`useReducer` 또는 커스텀 훅 도입**: `src/app/page.tsx`와 같이 여러 `useState`를 사용하는 컴포넌트의 상태 로직을 `useReducer`나 커스텀 훅으로 분리하여 가독성을 높이고 재사용성을 개선합니다. (예: `usePosts` 훅)

### 3. 코드 가독성 및 유지보수성 향상

- **상수 사용**: 정렬 옵션(`createdAt,DESC` 등)과 같은 문자열 리터럴을 상수로 분리하여 관리합니다. (예: `src/utils/constants.ts` 파일 생성)
- **타입 정의 구체화**: API 응답 등에서 `any`나 지나치게 일반적인 타입을 사용하는 부분을 찾아 더 구체적인 타입으로 명시하여 타입 안정성을 강화합니다.