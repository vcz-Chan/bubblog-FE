## [feat(ai/chat)] 포스트 상세에서 "이 글에 대해 질문하기" 전환 계획

### 목표
- 포스트 상세 화면에서 챗봇이 블로그 전체가 아닌 해당 "게시글 범위"로 질의하도록 전환.
- AI API 요청 바디에 `post_id`를 전달하고, SSE 신규 이벤트(`exist_in_post_status`)를 처리.
- 모바일/데스크탑 모두에서 "이 글에 대한 질문"임이 UI로 명확히 드러나도록 표시.

### 변경 범위 (Scope)
- API 클라이언트: `src/apis/aiApi.ts` — `askChatAPI`에 `postId?: number` 추가, 요청 바디에 `post_id` 포함, `exist_in_post_status` 콜백 처리 추가.
- 포스트 상세:
  - `src/components/Chat/ChatViewButton.tsx` — 버튼 문구를 "이 글에 대해 질문하기"로 변경, 모바일 링크에 `?postId=...` 쿼리 추가.
  - `src/app/post/[postId]/PostDetailClient.tsx` — `<ChatWindow>`에 `postId` 전달.
- 챗봇 UI:
  - `src/components/Chat/ChatWindow.tsx` — `postId` prop(선택) 지원, `askChatAPI` 호출 시 전달. `postId`가 있으면 카테고리 필터 비활성화/숨김 및 상단 배지로 "이 글 범위로 질문 중" 표시.
  - `src/app/chatbot/[userId]/page.tsx` — `searchParams`의 `postId` 수신, 전역 챗봇 화면에서도 글 범위 배지/가이드 노출, 카테고리 비활성화. 초기 안내 문구를 "이 글에 대해 물어보세요"(postId 있을 때)로 분기.
  - `src/components/Chat/ContextViewer.tsx` 등 기존 컴포넌트는 로직 변경 없이 재사용.

### API 반영 사항
- 엔드포인트: `POST /ai/ask` (인증 필요)
- 요청 바디에 `post_id`(number, optional) 추가. 존재 시 `category_id`는 서버에서 무시됨.
- SSE 이벤트 추가 처리: `exist_in_post_status` → `boolean` 값을 콜백으로 노출하여 UI 배지 상태 업데이트 가능하도록 함.

### 구현 단계
1) API 클라이언트 보강
   - `askChatAPI(question, userId, categoryId, personaId, onContext, onAnswerChunk, options?)` 시그니처를 확장:
     - `options?: { postId?: number; onExistInPostStatus?: (exists: boolean) => void }`
     - 요청 바디에 `post_id: options?.postId` 포함
     - SSE 파서에서 `event: exist_in_post_status` 수신 시 `onExistInPostStatus?.(true|false)` 호출

2) 포스트 상세 → 챗봇 연결
   - `ChatViewButton` 문구 변경 및 모바일 링크를 `/chatbot/${userId}?postId=${postId}`로 생성
   - `PostDetailClient`에서 `<ChatWindow userId={post.userId} postId={post.id} />`로 전달

3) 챗봇 UI 업데이트
   - `ChatWindow`에 `postId?: number` prop 추가
   - `postId`가 존재하면:
     - 상단에 배지/알림: "이 글 범위로 질문 중"(필요 시 제목 일부 표기)
     - 카테고리 선택 버튼 숨김 또는 비활성화 + 툴팁/설명 추가("게시글 범위 질문에서는 카테고리 필터가 적용되지 않습니다")
     - `askChatAPI` 호출 시 `options.postId` 전달, `onExistInPostStatus`로 존재 여부에 따라 배지 색상/텍스트 업데이트

4) 전역 챗봇 라우트 지원
   - `src/app/chatbot/[userId]/page.tsx`에서 `searchParams.postId` 파싱 → `number | undefined`
   - 위와 동일한 UI 분기와 바디 파라미터 전달 적용

5) 카피/가이드 문구 정리
   - 버튼: "이 글에 대해 질문하기"
   - 전역 챗봇 첫 안내: postId 존재 시 "이 글에 대해 물어보세요" / 없으면 기존 "블로그에 대해 물어보세요"

### 변경 파일(예정)
- `src/apis/aiApi.ts`
- `src/components/Chat/ChatWindow.tsx`
- `src/app/chatbot/[userId]/page.tsx`
- `src/app/post/[postId]/PostDetailClient.tsx`
- `src/components/Chat/ChatViewButton.tsx`

### 검증 계획
- 포스트 상세(데스크탑): 모달 챗봇 열기 → 상단 배지 노출, 카테고리 버튼 비활성화, 질문 전송 시 서버로 `post_id` 포함 확인(네트워크 탭) 및 답변 수신.
- 포스트 상세(모바일): 링크로 챗봇 페이지 이동(`/chatbot/:userId?postId=...`) → 동일 UI/동작.
- 전역 챗봇(블로그 범위): `postId` 없는 일반 진입 시 기존과 동일 동작 유지.
- SSE: `context`, `answer`, `end`, `exist_in_post_status` 정상 파싱 및 UI 반영 확인.

### 고려/주의 사항
- `postId` 모드에서 카테고리 필터는 서버에서 무시되므로 UI에서 혼동 방지(숨기거나 disabled 처리).
- 인증 만료 흐름은 `aiFetch` 재시도로 유지. 401 시 기존 로직 준수.
- 타입 호환성: 선택적 매개변수 추가로 역호환 보장.
