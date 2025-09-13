# Repository Guidelines

## Project Structure & Module Organization
- Source lives in `src/`:
  - App routes and pages: `src/app/**` (e.g., `src/app/page.tsx`, route folders with `page.tsx`).
  - UI components: `src/components/**` (PascalCase files like `PostCard.tsx`).
  - API clients: `src/apis/*Api.ts` via `apiClient.ts`.
  - Hooks: `src/hooks/**` (e.g., `usePosts.ts`).
  - State: `src/store/**` (Zustand stores).
  - Utilities and types: `src/utils/**`.
- Static assets: `public/`.
- CI/templates: `.github/` (PR/issue templates).

## Build, Test, and Development Commands
- `npm run dev` — Start local dev at `http://localhost:3000`.
- `npm run build` — Production build (Next.js).
- `npm start` — Serve the production build.
- `npm run lint` — ESLint check using `eslint.config.mjs`.

## Coding Style & Naming Conventions
- Language: TypeScript (`.ts/.tsx`). Use `.tsx` for React components.
- Components: PascalCase (`PostList.tsx`); hooks: `useX.ts`.
- Routes: Folder-based under `src/app/.../page.tsx`.
- Indentation: 2 spaces; prefer explicit types in public APIs.
- ESLint rules: React-in-JSX-scope off, `no-unused-vars` warn, `no-explicit-any` off, `next/no-img-element` off, `a11y alt-text` warn. Run `npm run lint` before PRs.

## Testing Guidelines
- No dedicated test setup is present. If adding tests, use Jest + React Testing Library for components and place tests near files (`X.test.tsx`) or under `__tests__/` mirroring `src/`.
- Aim for critical-path coverage (stores, hooks, utils). Keep tests deterministic and avoid network by mocking API clients.

## Commit & Pull Request Guidelines
- Commit small, scoped changes with clear subjects.
- PR title style (see template): `[type(scope)] subject` (e.g., `[feat(ai)] add RAG filter for post_id`).
- Link issues: `closes #123` / `relates #456`.
- PR must include: summary, context, changes, breaking changes (with migration), test plan (steps/commands), screenshots/logs if UI.
- Checklist: self-review, lint/build pass, tests added or N/A reason, docs/ENV updated, labels set.

## Security & Configuration Tips
- Secrets in `.env.local` (never commit). Use `NEXT_PUBLIC_` prefix only for values safe to expose to the client.
- When adding APIs, centralize base config in `src/apis/apiClient.ts` and reuse typed clients in `src/apis/*Api.ts`.

## Agent-Specific Notes
- Respect this guide and existing patterns; keep diffs minimal.
- Update relevant docs when adding routes/components.
- Prefer composition in `src/components` and colocated styles in `globals.css`/Tailwind.

## Project Overview: Bubblog

### Summary
- Next.js + TypeScript blog platform with CRUD posts, categories, likes/views, user profiles/settings, S3 uploads, and an AI chatbot via SSE.
- Frontend-only repo that talks to an API server and an AI server.

### Tech Stack
- Framework: Next.js (App Router)
- Lang/Styling: TypeScript, Tailwind CSS
- State: Zustand (`src/store/AuthStore.tsx`)
- Markdown: `@uiw/react-md-editor` + `rehype-highlight`
- Deploy: Vercel (assumed)
- Env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AI_API_URL` (see `.env.local`)

### Structure (key paths)
- `src/app`: routes/pages (home, blog, post, write, login, signup, settings, chatbot)
- `src/components`: UI (Post/Blog/Category/Chat/Persona/Common/Layout)
- `src/apis`: API client + domain clients (`apiClient.ts`, `blogApi.ts`, `authApi.ts`, `userApi.ts`, `categoryApi.ts`, `personaApi.ts`, `uploadApi.ts`)
- `src/store`: Zustand auth store
- `src/hooks`: `usePosts`, `useMediaQuery`
- `src/utils`: `types.ts`, `constants.ts`

### Auth & Tokens
- `apiClientWithAuth` adds `Authorization: Bearer <accessToken>` from Zustand.
- On 401: calls `reissue()` then retries once; otherwise safe logout. Cookies (`credentials: 'include'`) support refresh token on server.
- `aiFetch` mirrors the same behavior for AI server calls and returns `Response` for SSE handling.

### Core Features
- Posts: list/pagination/sort (`SORT_OPTIONS`), detail (CSR header + SSR body), create/update/delete.
- Categories: tree fetch/create/update/delete with selector modal.
- Images: presigned URL issue + PUT to S3 (`uploadApi.ts`); used by profile, thumbnails, markdown images.
- Markdown editor: `Post/MarkdownEditor.tsx` with custom image command and code highlighting.
- AI Chatbot: `askChatAPI` streams SSE events (`context`, `answer`), building context list and answer chunks; UI components in `src/components/Chat`.
- Stats: view count delayed increment (30s), like toggle.

### Run & Config
- Dev: `npm run dev` → `http://localhost:3000`
- Build/Start: `npm run build` / `npm run start`
- Lint: `npm run lint`
- Images: allowlist S3 domains in `next.config.ts` (`images.domains`).

### Design Notes
- Keep diffs minimal and follow the API layer patterns in `apiClient.ts`.
- Prefer SSR for heavy content (post body) and CSR for interactive parts.
- Centralize uploads via presigned URLs; avoid direct backend file posts.

## API Reference

All API calls are centralized through `src/apis/apiClient.ts`.

- `apiClientNoAuth(path, { method, params, body })` — No JWT; includes cookies.
- `apiClientWithAuth(path, { method, params, body, retry })` — Adds `Authorization` from Zustand; on 401 tries `reissue()` then 1 retry; includes cookies.
- `aiFetch(path, { method, params, body, retry })` — Same token behavior; returns `Response` for SSE.

Base URLs from env: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AI_API_URL`.

### authApi.ts
- `signup(payload)` — Create account. Auth: none.
- `login(payload)` — Issue accessToken; cookie session. Auth: none.
- `reissueToken()` — Refresh accessToken via cookie. Auth: none (cookie-based).
- `logout()` — Invalidate session. Auth: JWT.

### blogApi.ts
- `getBlogsPage(page?, size?, sort?)` — Paged list. Auth: none.
- `getBlogById(id)` — Post detail. Auth: none.
- `createBlog(payload)` — Create post. Auth: JWT.
- `updateBlog(id, payload)` — Update post. Auth: JWT.
- `deleteBlog(id)` — Delete post. Auth: JWT.
- `getPostsByUserPage(userId, page?, size?, sort?, categoryId?)` — User posts page. Auth: JWT.
- `putPostView(postId)` — Increment views (delayed in UI). Auth: JWT.
- `putPostLike(postId)` — Toggle like count. Auth: JWT.

### categoryApi.ts
- `getCategoryTree(userId)` — Fetch category tree. Auth: JWT.
- `createCategory({ name, parentId? })` — Create category. Auth: JWT.
- `updateCategory(id, { name?, newParentId? })` — Update category. Auth: JWT.
- `deleteCategory(id)` — Delete category. Auth: JWT.

### personaApi.ts
- `getPersonasByUser(userId)` — List personas. Auth: JWT.
- `createPersona({ name, description })` — Create persona. Auth: JWT.
- `updatePersona(id, { name, description })` — Update persona. Auth: JWT.
- `deletePersona(id)` — Delete persona. Auth: JWT.

### uploadApi.ts
- `getPresignedUrl(fileName, contentType)` — Request S3 PUT URL + final file URL. Auth: JWT.
- `uploadToS3(presignedUrl, file)` — PUT file to S3. Auth: none (signed URL).

### userApi.ts
- `getUserProfile(userId)` — Public profile. Auth: none.
- `updateUserProfile({ nickname, profileImageUrl })` — Update me. Auth: JWT.
- `deleteUserAccount()` — Delete my account. Auth: JWT.

### aiApi.ts
- `askChatAPI(question, userId, categoryId|null, personaId|-1, onContext, onAnswerChunk)` — Sends question to AI via SSE.
  - Emits `context` once with related posts; streams `answer` chunks.
