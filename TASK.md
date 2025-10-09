# Chatbot v1/v2 Support & In‑Chat Plan/Context Visualization

## Goal
- Support both AI ask APIs: v1 (`/ai/ask`) and v2 (`/ai/v2/ask`).
- Let the user switch version via a visible toggle (v1 | v2) before sending.
- When using v2, visualize the server “search plan” and related steps (rewrites, keywords, hybrid_result, search_result) in the chat stream as a collapsible panel at the top, not above the input.
- Move the current context viewer into the chat area as a top, collapsible item (applies to v1 too for consistency), replacing the input‑area context viewer.

## Non‑Goals
- No backend changes.
- No new persistence for user preference (keep version selection per chat window for now).
- No advanced formatting beyond minimal, readable UI (v1: context list; v2: plan + lists).

## High‑Level Design
- API layer
  - Keep existing `askChatAPI` (v1) intact.
  - Add `askChatAPIV2` that calls `/ai/v2/ask` and exposes additional SSE handlers.
  - Shared types: context items; add new v2 types for `SearchPlan`, `HybridResult`, etc.
- UI state
  - Add `askVersion: 'v1' | 'v2'` to Chat pages/components; default `v1`.
  - Disable version toggle while a request is streaming (`isSending`).
- SSE wiring
  - v1: keep `exist_in_post_status`, `context`, `answer` handling.
  - v2: additionally handle `search_plan`, `rewrite`, `keywords`, `hybrid_result`, `search_result`.
- Rendering
  - Introduce `InspectorPanel` rendered inside the scrollable chat area at the very top (collapsible).
    - v1: shows “Context” section only (current `ContextViewer` content moved here).
    - v2: shows “Search Plan”, “Rewrites”, “Keywords”, “Hybrid Result”, “Search Result”, and “Context”.
  - Update `ChatMessages` to accept an optional `header` ReactNode so the panel is part of the scrollable area and appears above messages.
  - Remove/hide the old input‑area `ContextViewer`.
- UX
  - Version toggle placed near input controls (e.g., alongside Category/Persona filters) or near header.
  - Panel is collapsed by default; visibly toggled with a button.

## Implementation Steps
1) API: Add v2 client
- File: `src/apis/aiApi.ts`
  - Add types: `SearchPlan`, `V2Events` payloads (`string[]` for rewrites/keywords; arrays for results).
  - Implement `askChatAPIV2(question, userId, categoryId, personaId, handlers, options)`:
    - POST to `/ai/v2/ask` via `aiFetch`.
    - Parse SSE events: `search_plan`, `rewrite`, `keywords`, `hybrid_result`, `search_result`, `exist_in_post_status`, `context`, `answer`, `end`, `error`.
    - Call respective callbacks in `handlers`.
  - Keep `askChatAPI` unchanged.

2) UI: Add version toggle
- Add `askVersion` state to `src/components/Chat/ChatWindow.tsx` and `src/app/chatbot/[userId]/page.tsx`.
- Create a small `VersionToggle` component (two‑button segmented control) and place it next to Persona/Category controls.
- Disable while `isSending` is true.

3) UI: Introduce InspectorPanel
- New file: `src/components/Chat/InspectorPanel.tsx`.
  - Props: `version`, `v1Context`, `v2Plan`, `v2Rewrites`, `v2Keywords`, `v2HybridResult`, `v2SearchResult`, `visible`, `onToggle`.
  - Renders a collapsible card with sections depending on `version`.
  - Each section renders a compact list; pretty‑print `SearchPlan` JSON for first iteration.

4) Messages container update
- Modify `src/components/Chat/ChatMessages.tsx` to accept an optional `header?: React.ReactNode` rendered before message list but inside the scrollable container.
- Update both chat entry points (`ChatWindow.tsx`, `page.tsx`) to pass `header={<InspectorPanel .../>}`.

5) Wire v1/v2 flows
- In `handleSubmit` of both chat UIs:
  - If `askVersion === 'v1'` → call `askChatAPI` and update `v1Context` in InspectorPanel state.
  - If `askVersion === 'v2'` → call `askChatAPIV2` and update plan/rewrites/keywords/results/context accordingly.
  - Continue accumulating `answer` chunks into the current bot message.
- Remove/hide the old `ContextViewer` below messages.

6) Edge cases & polish
- Reset InspectorPanel sections at the start of each send.
- If `postId` mode: still display `exist_in_post_status` feedback (badge remains) and show v2 plan (likely simplified by server).
- Guard JSON parsing errors; fail soft without breaking the stream.
- Keep automatic scroll behavior (ensure `header` height changes also trigger scroll).

7) Quick QA / Test Plan
- v1 blog‑wide: ask with/without category; confirm context appears in panel.
- v1 post‑specific: ask with `postId`; confirm exist badge behavior works.
- v2 blog‑wide: confirm plan shows, rewrites/keywords/hybrid_result/search_result list; context present; answer streams.
- v2 post‑specific: simplified plan; exist status; answer streams.
- Toggle version mid‑idle works; disabled during streaming.
- Mobile route `/chatbot/[userId]`: panel is scrollable, usable; modal post preview still works (if desired in v2 context/results).

## Types (draft)
- `SearchPlan` (subset per askV2.md):
  ```ts
  type SearchPlan = {
    mode: 'rag' | 'post';
    top_k?: number; threshold?: number;
    weights?: { chunk?: number; title?: number };
    filters?: { user_id: string; category_ids?: number[]; time?: any };
    sort?: string; limit?: number;
    hybrid?: { enabled: boolean; alpha?: number; max_rewrites?: number; max_keywords?: number };
    rewrites?: string[]; keywords?: string[];
  };
  ```

## Acceptance Criteria
- A user can switch between v1 and v2 before asking; only the selected version is used.
- For v2, the search plan and search steps (rewrites, keywords, hybrid_result, search_result) render in a collapsible panel at the very top of the chat area.
- For v1, the context list renders in the same panel at the top (replacing the old input‑area context viewer).
- Streaming answers continue to append to the current bot message.
- 401 behavior unchanged (auto reissue once, safe logout on failure).

## Risks / Mitigation
- SSE parsing variance: guard with try/catch and ignore malformed lines.
- Layout shift due to header panel: trigger scroll into view after updates.
- Backward compatibility: keep `askChatAPI` signature and usages; only add new call sites for v2.

## Follow‑ups (Optional)
- Persist version choice in localStorage.
- Plan prettifier (chips/tags, structured tables) and copy‑to‑clipboard.
- Show per‑section counts and timing (if server exposes).

---

## Phased Plan (Detailed)

### Phase 0 — Preparation & Design Freeze
- Review `askV2.md` and confirm SSE event names and payload shapes.
- Decide where to place new v2 types: start in `src/apis/aiApi.ts` for minimal diff.
- Define shared `ContextItem` shape compatibility (v1 uses `{ post_id, post_title }`, v2 examples show `{ postId, postTitle }`). Normalize to one internal shape for UI (e.g., `{ post_id: string, post_title: string }`).
- Acceptance check: Documented decisions reflected in code comments in aiApi.ts.

### Phase 1 — API Layer: v2 Client
- Task 1.1: Define types in `src/apis/aiApi.ts`
  - `export type SearchPlan = { mode: 'rag'|'post'; top_k?; threshold?; weights?; filters?; sort?; limit?; hybrid?; rewrites?; keywords? }`.
  - `export type PlanList = string[];`
  - `export type ContextBrief = { post_id: string; post_title: string };` (normalized).
  - `export type AskV2Handlers = { onPlan?; onRewrites?; onKeywords?; onHybridResult?; onSearchResult?; onExistInPostStatus?; onContext?; onAnswerChunk?; onError?; onEnd? }`.
- Task 1.2: Implement `askChatAPIV2(...)`
  - POST to `/ai/v2/ask` using `aiFetch`.
  - SSE parse loop mirroring v1 reader, but handle additional events with `try/catch` per line.
  - Normalize v2 result arrays (`hybrid_result`, `search_result`, `context`) to `ContextBrief[]`.
  - End/abort on `[DONE]` or `event: end`.
- Task 1.3: Robustness
  - If `content-type` is JSON, handle error payloads similarly to v1.
  - Ensure `retry` behavior remains within `aiFetch`.
- Acceptance check: Manual test hook (temporary page or console) prints plan and rewrites when hitting mock server; removed before PR merge if not used.

### Phase 2 — UI: Version Toggle Component
- Task 2.1: Create `src/components/Chat/VersionToggle.tsx`
  - Props: `value: 'v1'|'v2'`, `onChange: (v) => void`, `disabled?: boolean`.
  - UI: segmented control with two buttons; aria pressed states; keyboard accessible.
- Task 2.2: Place toggle in `ChatWindow.tsx` and `/chatbot/[userId]/page.tsx`
  - Near Persona/Category controls; respect `isSending` for `disabled`.
- Acceptance check: Toggle switches versions visually and via state; disabled while sending.

### Phase 3 — UI: InspectorPanel (Collapsible, In‑Chat Header)
- Task 3.1: Create `src/components/Chat/InspectorPanel.tsx`
  - Props:
    - `version: 'v1'|'v2'`
    - `visible: boolean`, `onToggle: () => void`
    - `v1Context?: ContextBrief[]`
    - `v2Plan?: SearchPlan | null`
    - `v2Rewrites?: string[]`, `v2Keywords?: string[]`
    - `v2HybridResult?: ContextBrief[]`, `v2SearchResult?: ContextBrief[]`
    - `v2Context?: ContextBrief[]`
  - Behavior: Renders a title bar with toggle button; sections render conditionally per version.
  - First iteration: plan JSON pretty‑printed in a `<pre>`; lists are bullet lines linking to `/post/:id`.
- Task 3.2: Style minimal Tailwind classes; ensure compact on mobile.
- Acceptance check: Panel mounts inside the chat scroll area; toggles open/closed; lists render.

### Phase 4 — Messages Container Update
- Task 4.1: Modify `src/components/Chat/ChatMessages.tsx`
  - Add optional prop `header?: React.ReactNode`.
  - Render `{header}` before the messages list inside the scrollable container.
- Task 4.2: Update import usages to pass `header` in chat UIs.
- Acceptance check: Panel appears above first message; scrolling behaves as before.

### Phase 5 — Integrate v1/v2 Flow in ChatWindow
- Task 5.1: Add state
  - `askVersion`, default `'v1'`.
  - Inspector state: `inspectorOpen`, `v1Context`, and for v2: `plan`, `rewrites`, `keywords`, `hybridResult`, `searchResult`, `v2Context`.
- Task 5.2: Reset logic on send start
  - Clear all inspector state, `existInPost` to `null` (where applicable), context arrays to `[]`.
- Task 5.3: Branch call in `handleSubmit`
  - v1 → existing `askChatAPI` with handlers writing to `v1Context` and bot message appending.
  - v2 → `askChatAPIV2` with handlers writing to inspector states + bot message appending.
- Task 5.4: Header injection
  - Pass `<InspectorPanel ... />` to `ChatMessages` as `header`.
- Task 5.5: Remove/hide old `ContextViewer` usage in this component.
- Acceptance check: Both versions stream answers; inspector content updates live; old input‑area context is gone.

### Phase 6 — Integrate v1/v2 Flow in Route Page `/chatbot/[userId]/page.tsx`
- Mirror tasks from Phase 5 adapted to the route page state.
- Keep modal post preview (`PostModal`) if using inspector context lists (optional link opening behavior stays).
- Acceptance check: Mobile/route page behavior matches embedded ChatWindow.

### Phase 7 — Badge and Post‑Scoped UX
- Preserve/extend existing `existInPostStatus` badge.
- For v2 post mode, ensure status events still update the badge and inspector context.
- Acceptance check: Badge reflects true/false; title truncation intact.

### Phase 8 — Error & Edge Handling
- v2 `error` event → show message in current bot bubble and keep inspector collapsed state unchanged.
- Guard JSON parsing; ignore malformed lines; no crashes.
- Cancel reader on end or component unmount to avoid leaks (ensure try/finally in callers sets `isSending` false and clears input).
- Acceptance check: Network failure shows a friendly error in bot message.

### Phase 9 — Styling & Scroll Behavior
- Ensure opening/closing inspector auto‑scrolls to bottom (`chatEndRef.scrollIntoView`).
- Keep spacing consistent with message bubbles.
- Acceptance check: No layout jumps obscure latest bot message.

### Phase 10 — QA Plan
- v1 blog‑wide: with/without category; context shows in inspector; answer streams.
- v1 post‑specific: badge states for exist true/false; answer streams.
- v2 blog‑wide: plan/rewrites/keywords/hybrid_result/search_result/context appear; answer streams.
- v2 post‑specific: simplified plan; exist status; answer streams.
- Toggle version idle vs. during send disabled state.
- Mobile viewport: panel usable; long plan scrollable.

### Phase 11 — Documentation
- Update `TASK.md` (this file) status as phases complete.
- Add a short section to `GEMINI.md` or new `AI.md` referencing v2 UI behavior (optional).

### Phase 12 — Optional Enhancements
- Persist `askVersion` in localStorage per user.
- Pretty plan renderer (chips/tags); copy JSON button.
- Telemetry hooks for plan section toggles (if analytics exists).

