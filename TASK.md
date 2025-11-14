
# ASK 세션 기능 초기 설계

## 1. 현황 정리
- `src/app/chatbot/[userId]/page.tsx` 는 로컬 상태(`messages`)만으로 챗 UI를 구성하고 있어, 새로고침 시 기록이 사라지고 세션 ID 개념이 없음.
- `src/apis/aiApi.ts` 의 `askChatAPIV2` 는 질문/카테고리/페르소나만 전송하며, SSE 이벤트도 검색 관련 정보만 처리한다. `session`, `session_saved`, `session_error` 등 새 이벤트와 REST 세션 API가 빠져 있음.
- 세션/히스토리 REST 요청을 위한 API 클라이언트(`GET /ai/v2/sessions`, `/sessions/:id/messages`) 및 타입이 존재하지 않으며, UI에서도 세션 목록/관리 탭이 없다.

## 2. 요구 기능 요약
1. ASK 요청 시 세션 ID를 `null`로 넘겨 신규 세션을 만들고, SSE에서 받은 `session_id`를 이후 질문에 재사용.
2. 내 세션 리스트를 불러와 좌측 “세션 관리” 탭(또는 패널)로 보여주고, 커서 기반 무한 로딩을 지원.
3. 특정 세션을 선택하면 해당 세션의 메시지를 최신 순으로 불러오고, 스크롤 최상단 진입 시 과거 메시지를 추가 로딩(무한 스크롤).
4. SSE 스트림으로 들어오는 메시지를 현재 세션의 UI에 반영하고, `session_saved`, `session_error`에 따라 상태 및 토스트를 갱신.

## 3. 구현 계획

### 3.1 API/타입 레이어 확장
1. `src/apis/aiApi.ts`
   - `askChatAPIV2(question, userId, sessionId, categoryId, personaId, handlers, options)` 처럼 시그니처를 바꿔 `sessionId`를 명시적으로 받는다(새 세션일 땐 `null`). `requester_user_id`는 서버에서 세션 생성 시 검증하므로 body에 항상 넣는다.
   - SSE 파서에 `session`, `session_saved`, `session_error`, `session_timeout` 등을 추가하고, 핸들러 타입에 `onSession`, `onSessionSaved`, `onSessionError` 콜백을 포함한다. `session-id` 헤더는 fallback 으로만 쓰고, 기본은 `session` 이벤트 payload를 신뢰하도록 명시.
   - Context/answer 이외의 메시지(`event: message_user`, `event: message_assistant` 등) 발생 가능성에 대비해 공통 `onStreamMessage(role, chunk)` 시그니처를 추가하고, 추후 히스토리 append 로직이 같은 포맷을 쓰도록 한다.
2. 세션 REST API 클라이언트
   - `src/apis/aiSessionApi.ts` 파일을 새로 만들고 `getChatSessions`, `getChatSession`, `getChatSessionMessages` API를 정의한다. 파일 내부에서 `aiFetch`를 재사용해 베이스 URL/에러 처리를 일관되게 유지한다.
   - `src/utils/types.ts` 에 `ChatSession`, `ChatSessionMessage`, `ChatSessionPaging` 타입을 추가해 API/스토어/UI가 동일한 구조를 바라보도록 한다(예: `ChatSessionMessage['role']` 는 `'user' | 'assistant'`).

### 3.2 상태 관리 & 훅
1. 공통 zustand 스토어
   - `src/store/ChatSessionStore.ts` 를 만들고, `sessions`, `sessionsPaging`, `currentSessionId`, `messagesBySession`, `messagesPagingBySession`, `isSessionPanelOpen`, `isStreaming` 등을 한 곳에서 관리한다.
   - 주요 액션: `fetchInitialSessions`, `fetchMoreSessions`, `selectSession(sessionId | null)`, `resetSession(userId)`, `fetchMessages(sessionId, { cursor, direction })`, `prependMessages`, `appendMessages`, `upsertSessionFromStream`, `appendStreamingChunk`, `setPanelOpen`.
   - SSE 이벤트 핸들러는 이 스토어 액션을 직접 호출해 전역 상태를 갱신하고, 페이지 컴포넌트는 `useChatSessionStore(selector)` 조합으로 필요한 조각만 구독한다.
2. 훅 레이어
   - `useChatSessions(userId)` 훅은 zustand 액션을 감싼 얇은 커스텀 훅으로, 초기 로딩/추가 로딩 호출과 MEMOized 파생값(`sortedSessions`, `selectedSession`)을 제공한다.
   - `useSessionMessages(sessionId)` 훅 역시 zustand 상태를 구독하면서 스크롤 로딩/스트리밍 append 를 담당한다. UI가 훅만 사용하도록 만들어 컴포넌트 복잡도를 낮춘다.

### 3.3 UI 구조 개편
1. 레이아웃
   - 챗봇 페이지를 좌측 `세션 패널` + 우측 `대화 영역` 으로 나누는 컨테이너 컴포넌트 생성.
   - 상단 햄버거 버튼으로 세션 패널을 열고 닫을 수 있도록 제어 상태(`isSessionPanelOpen`)를 두고, 모바일/태블릿에서는 전체 화면 Drawer(뒤 배경 dim 처리), 데스크톱에서는 기본 오픈 + width 축소 애니메이션을 적용한다. 햄버거 버튼은 `ProfileHeader` 우측에 배치해 항상 접근 가능하게 한다.
2. 세션 패널
   - 세션 카드에는 `title`(없으면 첫 user 메시지 앞부분), `updated_at`, `message_count`를 표시하고 선택 상태를 강조.
   - “새 세션 시작” 버튼: 클릭 시 현재 `currentSessionId` 를 `null`로 초기화하고 다음 질문을 새 세션으로 전송하도록 상태 변경.
   - 하단 “더 보기” 또는 스크롤 감지 시 `loadMore()` 호출.
3. 메시지 영역
   - `ChatMessages` 를 그대로 쓰되 prop 구조를 `messages: Array<UIChatMessage | ChatSessionMessage & { inspector?: InspectorData }>` 로 확장하고, 서버 메시지에는 `inspector`가 없을 수 있음을 허용한다(4단계에서 관련 호출부 전체를 한 번에 업데이트할 예정).
   - 스크롤 영역 상단에 `div` sentinel을 두고 `IntersectionObserver` 로 진입 감지 → `prependOlder()` 호출, 응답 도착 후에는 기존 scrollHeight 차이를 이용해 스크롤 위치를 유지(React 18에서도 안정적). loading 중에는 skeleton bubble을 잠시 노출.
   - Inspector 패널은 스트리밍 메시지(실시간 질문)에만 붙이고, 과거 히스토리는 collapse 된 `ContextSummary` 정도만 노출하는 식으로 경량화한다.

### 3.4 ASK 전송 흐름 업데이트
1. `handleSubmit`
   - zustand에서 `currentSessionId` 를 읽어 `askChatAPIV2` 에 전달하고, `null`일 경우 body에 `session_id: null`, `user_id: ownerUserId`, `requester_user_id: viewerId`를 명시한다. `viewerId` 는 `useAuthStore` 의 `userId` 값(로그인 사용자)이며, 비로그인일 때는 추후 정의할 게스트 ID(or null) 정책을 따른다.
   - SSE `onSession` 콜백이 오면 즉시 `selectSession(newId)` + `upsertSessionFromStream(payload)`를 호출해 패널 리스트에도 새 항목을 넣는다. 헤더 값만 들어오고 이벤트가 없을 경우 대비하여 fallback 로직도 추가.
   - 전송 직후엔 로컬 메시지를 `messagesBySession[tempSessionKey]` 에 push 해 UI가 즉시 반응하도록 하고, SSE chunk 가 오면 `appendStreamingChunk` 액션이 현재 세션 메시지를 업데이트한다.
2. 스트림 종료 처리
   - `session_saved` 이벤트에서 `cached` 여부와 최종 `message_count` 를 받아 해당 세션 카드 메타 정보를 갱신하고, 필요하면 `fetchMessages(sessionId, { direction: 'forward' })` 로 최신화한다.
   - `session_error` 수신 시 현재 스트림 메시지를 에러 상태로 표시하고, `selectSession(null)` + 토스트 노출을 한 번에 처리한다(실패 세션은 리스트에서 제거하거나 `failed` 구분값을 두어 재시도 UX 제공).

### 3.5 무한 스크롤 & UX 세부사항
1. 메시지 히스토리 로딩 동작 정의
   - 최초 세션 선택 시 `direction=backward` 로 20개 로드 후 리스트 하단으로 스크롤, 이후 새 메시지가 오면 append.
   - 상단 sentinel 이 viewport 에 들어오면 `cursor=messagesPagingBySession[sessionId].prevCursor` 로 과거 데이터를 불러와 `prependMessages` 한다. prepend 직후 `(scrollHeight_after - scrollHeight_before)` 만큼 `scrollTop` 을 보정해 위치가 튀지 않도록 한다.
2. 에러/빈 상태 처리
   - 세션이 없을 때는 “첫 질문을 해보세요” CTA 제공.
   - 목록/메시지 로딩이 실패하면 zustand 에 `lastError` 를 기록하고, 패널/메시지 영역 각각에 재시도 버튼을 노출한다. 에러 상태가 풀리면 자동으로 토스트를 닫는다.

## 4. 다음 단계
1. API 클라이언트/타입 작성 → 유닛(또는 간단한 런타임 테스트)으로 JSON 형태 검증.
2. zustand 스토어 + 훅 구현 → Fake API 응답(Mock Service Worker 또는 임시 JSON)으로 세션 리스트/메시지 로직을 검증.
3. UI/흐름 통합 → 실제 SSE 없이도 dev 에서 동작하도록 `askChatAPIV2` 를 주입형으로 감싸고, 필요 시 `ChatbotPage.stories.tsx` 같은 문서화도 고려.

## 5. 커밋 단위 구현 계획
1. **[feat(api)] ai 세션 타입/클라이언트 추가**  
   - `src/utils/types.ts` 에 `ChatSession*` 타입 정의.  
   - `src/apis/aiSessionApi.ts` 신설, 세션 목록/상세/메시지 API 함수 구현.  
   - `askChatAPIV2` 시그니처 초안만 정의(아직 호출부 수정 X) 및 새로운 SSE 이벤트 핸들러 타입 선언.
2. **[feat(store)] ChatSessionStore 및 훅 도입**  
   - `src/store/ChatSessionStore.ts` 생성, 상태/액션/초기값 구현.  
   - `src/hooks/useChatSessions.ts`, `src/hooks/useSessionMessages.ts` 작성해 zustand 액션을 래핑.  
   - 임시 mock 함수나 dev-only util로 스토어 로직을 간단히 검증.
3. **[feat/ui] 세션 패널/햄버거 레이아웃 구축**  
   - `src/app/chatbot/[userId]/page.tsx` 레이아웃을 세션 패널 + 대화 영역으로 분리.  
   - 햄버거 버튼, Drawer/축소 UI, 세션 리스트 컴포넌트(`SessionListPanel.tsx`) 추가.  
   - 패널과 store를 연결, 기본 세션 로딩/빈 상태 UI 구현.
4. **[feat(chat)] 메시지 영역 무한 스크롤 + SSE 연동**  
   - `ChatMessages` 컴포넌트 prop 확장 및 sentinel 기반 무한 스크롤 구현.  
   - `askChatAPIV2` 본격 수정: `session_id` 전달, `onSession`/`onSessionSaved`/`onSessionError` 등 호출 시 zustand 액션 연동. 해당 커밋에서 기존 호출부 전부(챗봇 페이지, 기타 컴포넌트)를 새 시그니처로 업데이트.  
   - `handleSubmit` 로직을 훅/store 중심으로 재작성하고 임시 메시지/스트리밍 업데이트 처리.
5. **[feat/polish] 오류 처리·토스트·UX 마감**  
   - `session_saved` 캐시 배지, `session_error` 토스트, 재시도 버튼, loading skeleton 등 UX 디테일 반영.  
   - API 실패/네트워크 해제 대응, 패널/메시지 에러 상태 컴포넌트.  
   - 문서(TASK.md or ASK_SESSION_INTEGRATION.md subsection) 및 TODO 코멘트 정리, 린트 확인.
