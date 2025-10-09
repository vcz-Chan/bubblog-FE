# 카테고리 UI 개선 계획 (Category UI Revamp)

## 목표
- 사용성: 빠르게 찾고 선택할 수 있는 간결한 흐름 제공.
- 심미성: 일관된 여백/색/타이포와 부드러운 인터랙션으로 "깔끔하고 이쁜" UI.
- 접근성: 키보드 내비게이션/스크린리더 호환성 강화.
- 안정성: 기존 페이지와의 호환 유지, API/타입은 그대로 재사용.

## 범위
- 컴포넌트: `src/components/Category/CategoryFilterButton.tsx`, `src/components/Category/CategorySelector.tsx` 개선 및 공용 Confirm 모달 추가.
- 사용처: 
  - 블로그 리스트: `src/app/blog/[userId]/BlogPageClient.tsx`
  - 채팅: `src/components/Chat/ChatWindow.tsx`, `src/app/chatbot/[userId]/page.tsx`
  - 글쓰기: `src/app/write/WritePostClient.tsx`
- 비범위(Out of scope): 카테고리 API 계약 변경, 서버 스키마 변경.

## 현재 이슈 요약
- 루트 생성 버튼 노출 조건 버그: `creatingParentId === undefined` 조건으로 버튼이 표시되지 않음.
- 드래그 가능 표시 혼동: 비소유자도 `draggable` 속성이 존재해 드래그 가능처럼 보임.
- 새로고침 아이콘 혼동: `XCircleIcon` 사용으로 의미 불명확.
- confirm/alert 사용: 브라우저 기본 다이얼로그로 일관된 UI 저해.
- 스타일 조밀/정보 과다: 여백/라인/타이포/아이콘 정리 필요.
- 접근성: 키보드 탐색, 포커스 표시, aria 레이블 강화 필요.

## 개선안 상세
- 레이아웃/스타일
  - 리스트 항목: 여백 증가, 라운드/섀도우 절제, hover/active/focus 명확화.
  - 인덴트: Tailwind 유틸만 사용, 인라인 style 최소화.
  - 헤더: 제목 + 검색창 + 새로고침을 정렬 정돈, 아이콘 툴팁 추가.
  - 스크롤: 최대 높이 내부 스크롤, sticky 헤더로 검색 고정.
- 상호작용/UX
  - 루트 생성 토글: "최상위 추가" 버튼 → 클릭 시 인라인 입력 폼 표시. 상태는 `isCreatingRoot`로 명확 분리 또는 `creatingParentId`의 `undefined|null|number` 3상 분리.
  - 드래그앤드롭: 소유자에게만 `draggable` 속성/핸들러 부여. 드롭 타겟 hover 시 미묘한 강조 테두리.
  - 새로고침: `ArrowPathIcon`으로 교체, 로딩 상태 스피너 노출.
  - 삭제 확인: 공용 `ConfirmModal` 도입해 브라우저 confirm 대체.
  - 검색: 일치 텍스트 하이라이트, 자동 확장 유지.
  - 선택 해제: 상단 버튼을 토글형으로 명확히 스타일링.
- 접근성
  - 트리 항목 버튼에 `aria-expanded`, `aria-controls`(옵션), 라벨 보강.
  - 키보드: ↑/↓ 이동, → 확장, ← 접기, Enter 선택 기본 지원(최소 Tab/Enter는 보장).
  - 포커스 링 명확화.

## 단계별 작업 계획 (Milestones)
1) 기능 버그 및 혼동 요소 해결
- [ ] 루트 생성 버튼 토글 버그 수정 (`creatingParentId` 상태 정리)
- [ ] 비소유자 `draggable` 제거, 소유자에게만 설정
- [ ] 새로고침 아이콘 `ArrowPathIcon`으로 교체
- [ ] 로딩/에러 메시지 톤 및 배치 정리

2) 공용 모달 도입 및 confirm/alert 치환
- [ ] `src/components/Common/ConfirmModal.tsx` 추가 (타이틀/메시지/확인/취소 props)
- [ ] `CategorySelector`의 삭제 확인을 `ConfirmModal`로 교체

3) 스타일 리뉴얼 및 UX 개선
- [ ] 트리 항목 카드형 라인 → 간결한 리스트형으로 정리(적절한 padding/간격/아이콘 크기 재조정)
- [ ] 선택된 항목 강조(배경/텍스트/아이콘 색상 일관)
- [ ] 검색 일치어 하이라이트 처리
- [ ] 헤더를 sticky로 고정(검색/컨트롤 유지)
- [ ] 드롭 타겟 시 테두리 강조

4) 접근성 & 키보드 지원
- [ ] aria 속성/레벨 보강, 버튼 라벨 보정
- [ ] 포커스 스타일 강화
- [ ] 최소 Tab/Enter 흐름 확인, 단축키 안내는 툴팁로 간단히 제공

5) 마무리 및 적용 범위 검수
- [ ] 사용처(블로그/채팅/글쓰기)에서 UI 일관성/레이아웃 깨짐 점검
- [ ] 빈 상태/카테고리 없음/오류 상태/대규모 트리(성능) 점검
- [ ] `npm run lint` 및 빌드 확인

## 컴포넌트별 변경사항
- `CategoryFilterButton`
  - 라벨 절삭/툴팁, 아이콘 정렬, 크기 변형(sm/md) prop 고려
- `CategorySelector`
  - 상태 정리: `creatingParentId` → 삼값 또는 `isCreatingRoot` 추가
  - confirm/alert 제거, `ConfirmModal` 사용
  - 스타일/레이아웃 전반 리뉴얼(헤더 sticky, 리스트 간격, 포커스 링)
  - DnD 시각화(hover 강조 테두리), 비소유자 드래그 제거
- `Common/ConfirmModal.tsx`
  - 공용 확인 모달 추가, 블로그 삭제용 모달과 스타일 일관화

## 테스트 계획
- 시나리오
  - [ ] 트리 로드/검색/펼침/선택/해제
  - [ ] 루트/자식 생성/수정/삭제(소유자/비소유자 각각)
  - [ ] DnD로 부모 변경, 루트 드롭 이동
  - [ ] 블로그/채팅/글쓰기 화면에서 카테고리 선택이 정상 반영
  - [ ] 모바일(≤768px)에서 레이아웃/터치 타겟 확인
- 품질 체크
  - [ ] 접근성(포커스 이동, aria 레이블) 수동 검증
  - [ ] `npm run lint` 무경고 또는 허용 경고 수준 유지
  - [ ] 빌드 성공 및 콘솔 에러 없음

## 완료 기준 (Acceptance Criteria)
- 모든 사용처에서 카테고리 선택/CRUD/DnD가 동작하며 시각적으로 일관.
- 브라우저 기본 confirm/alert 미사용, 공용 모달로 대체.
- 루트 생성 버튼/폼 토글이 직관적으로 동작.
- 비소유자 드래그 비활성, 소유자 드래그 시 시각 피드백 존재.
- 검색 키워드 하이라이트 및 자동 확장이 유지.
- 접근성 기본 요건(Tab/Enter 흐름, 포커스 표시) 만족.

## 리스크/주의사항
- 대규모 트리 성능: 필요 시 가상 스크롤 고려(현 단계는 비범위).
- DnD 예외 처리: 자기 자신/자식으로의 이동 금지 로직 추가 고려.
- 모달 중첩: 페이지 내 다른 모달과 z-index 충돌 여부 확인.

## 향후 확장 아이디어(선택)
- 커맨드 팔레트(빠른 검색/생성) 모드 추가
- 최근 사용 카테고리/고정(핀) 기능
- 카테고리 배지 색상/아이콘 커스터마이징

---

작업 원칙
- 기존 API/타입/호출은 유지하여 영향 범위 최소화.
- 공통 컴포넌트 재사용(Button/Modal), Tailwind 유틸로 스타일 일관성 확보.
- 작은 PR 단위로 단계별 머지(1→5 순서), 각 단계마다 `npm run lint` 확인.
