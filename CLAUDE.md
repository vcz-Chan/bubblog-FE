# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Primary Role: UI/UX Design & Front-end Enhancement Specialist**

이 프로젝트에서 Claude는 주로 **디자인 개선과 사용자 경험 향상**을 담당합니다. 기존 기능을 유지하면서 시각적 완성도를 높이고, 인터랙션을 세밀하게 다듬는 역할입니다. 모든 변경사항은 반응형, 접근성, 성능을 고려하여 점진적으로 적용됩니다.

## Project Overview

Bubblog is a Next.js blog platform with an AI-powered chatbot feature. The frontend interacts with two backend services: a main API server for blog/user data and an AI server for chat functionality with RAG (Retrieval-Augmented Generation).

**Tech Stack:**
- Next.js 15 (App Router) with TypeScript
- Tailwind CSS v4 for styling
- Zustand for state management
- Markdown editing with `@uiw/react-md-editor` and syntax highlighting
- Server-Sent Events (SSE) for AI streaming responses
- Framer Motion & GSAP for animations
- HeadlessUI & Radix UI for accessible components
- Lucide React for icons

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` - Main API server base URL
- `NEXT_PUBLIC_AI_API_URL` - AI server base URL
- Configure these in `.env.local` (never commit this file)

## Development Commands

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Run production build locally
npm start

# Lint check
npm run lint
```

## Architecture

### Directory Structure

- `src/app/` - Next.js App Router pages and routes
  - Each route folder contains `page.tsx` (e.g., `blog/`, `chatbot/`, `write/`)
  - `layout.tsx` defines the root layout with auth initialization
  - `globals.css` contains Tailwind base styles and custom CSS
- `src/components/` - React components organized by feature
  - `Chat/` - AI chatbot UI (messages, inspector, session panel)
  - `Blog/`, `Post/`, `Comment/` - Blog content components
  - `Common/` - Shared UI components
  - `Layout/` - Layout-related components
- `src/apis/` - API client layer
  - `apiClient.ts` - Core fetch wrappers with auth/retry logic
  - `*Api.ts` - Domain-specific API clients (blog, auth, user, AI, etc.)
- `src/store/` - Zustand global state stores
  - `AuthStore.tsx` - Authentication state and token management
  - `ChatSessionStore.ts` - AI chat session and message state
  - `ProfileStore.tsx` - User profile state
- `src/hooks/` - Custom React hooks
- `src/utils/` - Type definitions and utility functions

### API Client Pattern

All API requests go through centralized client functions in `src/apis/apiClient.ts`:

1. **`apiClientNoAuth(path, options)`** - For public endpoints (login, signup, public posts)
   - Includes cookies for server-side session handling
   - Returns typed `APIResponse<T>` with `{ success, code, message, data }`

2. **`apiClientWithAuth(path, options)`** - For authenticated endpoints
   - Automatically adds `Authorization: Bearer <token>` header from `AuthStore`
   - On 401 error: attempts token refresh via `reissue()`, then retries once
   - On refresh failure: triggers safe logout
   - Includes cookies for refresh token

3. **`aiFetch(path, options)`** - For AI server requests
   - Same auth/retry logic as `apiClientWithAuth`
   - Returns raw `Response` object (needed for SSE stream handling)
   - Used by `askChatAPI` and `askChatAPIV2` for streaming responses

### Authentication Flow

- Tokens managed by Zustand store (`src/store/AuthStore.tsx`)
- Access token stored in memory, refresh token in HTTP-only cookie
- Token refresh is automatic and transparent via `apiClientWithAuth`
- Protected routes should check `useAuthStore` for `isAuthenticated` state
- `ClientAuthInit` component in root layout initializes auth state on mount

### AI Chat Architecture

The chatbot uses a **session-based conversation system** with SSE streaming:

1. **Session Management** (`ChatSessionStore.ts`)
   - Sessions track conversation history between user and AI
   - Each session belongs to an owner (blog user) and requester (visitor)
   - `currentSessionId: null` creates a new session on next question
   - Sessions are fetched with cursor-based pagination

2. **SSE Stream Events** (from `/ai/v2/ask`)
   - `event: session` - Provides `session_id` for new conversations
   - `event: search_plan` - Shows RAG search strategy
   - `event: context` - Related blog posts found
   - `event: answer` - LLM response chunks (streamed)
   - `event: session_saved` - Confirms message persistence (with `cached` flag)
   - `event: session_error` - Session save failures

3. **Message History**
   - Infinite scroll loading (bidirectional: backward for older, forward for newer)
   - Messages are cached in `messagesBySession` keyed by `session_id`
   - Streaming messages are tracked separately during generation

4. **UI Components** (`src/components/Chat/`)
   - `SessionListPanel` - Session browser with infinite scroll
   - `ChatMessages` - Message list with streaming support
   - `InspectorPanel` - Shows RAG search plan and context
   - `ChatInput` - Question submission form

### Image Uploads

Images use presigned S3 URLs (see `src/apis/uploadApi.ts`):
1. Request presigned URL from API: `getPresignedUrl(fileName, contentType)`
2. Upload file directly to S3: `uploadToS3(presignedUrl, file)`
3. Use returned `fileUrl` in post content or profile

S3 domains must be allowlisted in `next.config.ts` under `images.remotePatterns`.

### Markdown Editing

- Editor: `@uiw/react-md-editor` with custom toolbar commands
- Preview: `react-markdown` with `rehype-highlight` for syntax highlighting
- Custom image upload command integrated in `MarkdownEditor.tsx`
- Supports GFM (tables, strikethrough, task lists) via `remark-gfm`

## UI/UX Design Guidelines

**Role: Design & Front-end Enhancement Specialist**

This project prioritizes **visual refinement and user experience improvements** without breaking existing functionality. When making design changes:

### Core Principles

1. **Preserve Functionality** - Never modify logic, API calls, or state management when improving UI
2. **Progressive Enhancement** - Add visual polish incrementally, testing after each change
3. **Consistency** - Maintain design language across all components
4. **Performance** - Animations should be smooth (60fps), use CSS transforms and opacity when possible
5. **Accessibility First** - All interactive elements must be keyboard navigable and screen-reader friendly

### Design System

**Color Palette:**
- Use Tailwind's semantic color classes consistently
- Dark mode support via Tailwind's `dark:` variants
- Maintain proper contrast ratios (WCAG AA minimum)

**Typography:**
- Geist font family (loaded via `next/font`)
- Establish clear hierarchy: headings, body, captions
- Line height: 1.5-1.7 for body text, tighter for headings
- Letter spacing: Use Tailwind's tracking utilities sparingly

**Spacing:**
- Follow 4px/8px grid system (Tailwind's default spacing scale)
- Consistent padding/margin: prefer `p-4`, `p-6`, `p-8` over arbitrary values
- Use `space-y-*` and `space-x-*` for consistent gaps

**Borders & Shadows:**
- Border radius: `rounded-lg` (8px) for cards, `rounded-xl` (12px) for modals
- Shadows: Use Tailwind's shadow scale, prefer subtle `shadow-sm` and `shadow-md`
- Border colors: Use opacity-based borders like `border-gray-200 dark:border-gray-800`

### Animation Guidelines

**Framer Motion** (preferred for React components):
```tsx
// Smooth entrance animations
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
>
```

**Common animation patterns:**
- Page transitions: fade + slide (y: 10-20px)
- Hover states: scale 1.02-1.05, transition duration 150-200ms
- Loading states: Skeleton screens with shimmer effect
- Modal/drawer: backdrop blur + slide from edge
- List items: stagger children with `staggerChildren: 0.05`

**GSAP** (for complex scroll animations):
- Use for parallax, scroll-triggered sequences
- Always clean up with `ScrollTrigger.kill()` in useEffect cleanup

**Performance:**
- Avoid animating `width`, `height`, `top`, `left` - use `transform` instead
- Use `will-change` sparingly and remove after animation
- Prefer CSS transitions for simple hover/focus states

### Component Design Patterns

**Buttons:**
- Primary: Bold color, prominent shadow
- Secondary: Outline or ghost style
- Sizes: `sm` (32px), `md` (40px), `lg` (48px) height
- States: default, hover, active, disabled, loading
- Icon buttons should have `aria-label` and minimum 44x44px tap target

**Cards:**
- Subtle border or shadow for depth
- Hover state: Lift effect with increased shadow
- Internal padding: `p-6` for desktop, `p-4` for mobile
- Rounded corners: `rounded-lg` or `rounded-xl`

**Forms:**
- Input height: minimum 44px for touch targets
- Focus rings: Tailwind's `focus:ring-2 focus:ring-blue-500`
- Error states: Red border + error message below with icon
- Labels: Always present, use `text-sm font-medium` above inputs

**Loading States:**
- Skeleton screens matching content layout
- Spinner for async actions (button loading)
- Shimmer effect for placeholder content
- Use `aria-busy="true"` and `aria-live="polite"`

**Modals & Drawers:**
- Backdrop: `bg-black/50` with backdrop blur
- Animation: Slide + fade (from bottom on mobile, center on desktop)
- Close button: Always top-right, accessible via Escape key
- Focus trap: Use HeadlessUI Dialog or Radix Dialog

**Chat Interface:**
- Messages: Clear visual distinction between user/assistant
- Streaming: Show typing indicator, smooth text reveal
- Timestamps: Subtle, relative time format
- Actions: Copy, regenerate buttons on hover
- Code blocks: Syntax highlighting, copy button top-right

### Responsive Design

**Breakpoints** (Tailwind defaults):
- `sm: 640px` - Small tablets
- `md: 768px` - Tablets
- `lg: 1024px` - Small desktops
- `xl: 1280px` - Desktops
- `2xl: 1536px` - Large desktops

**Mobile-first approach:**
```tsx
// Base styles for mobile, then scale up
<div className="p-4 md:p-6 lg:p-8">
```

**Touch targets:**
- Minimum 44x44px for all interactive elements
- Increase spacing between clickable items on mobile
- Use larger font sizes on mobile for readability

**Navigation:**
- Mobile: Hamburger menu with slide-out drawer
- Desktop: Horizontal nav or sidebar
- Always show current page indicator

### Accessibility Checklist

- [ ] All images have `alt` text (or `alt=""` for decorative)
- [ ] Interactive elements are keyboard accessible (Tab, Enter, Space)
- [ ] Focus indicators are visible and clear
- [ ] Color is not the only means of conveying information
- [ ] Form inputs have associated labels
- [ ] ARIA labels on icon-only buttons
- [ ] Proper heading hierarchy (h1 → h2 → h3)
- [ ] Skip navigation links for keyboard users
- [ ] Modals trap focus and close on Escape
- [ ] Loading/error states announced to screen readers

### Common UI Improvements

**Micro-interactions to add:**
- Button press effect (scale 0.98 on click)
- Smooth color transitions on hover (150-200ms)
- Icon animations (rotate, bounce) on state changes
- Success checkmarks with animated stroke
- Number counters with animated increments
- Ripple effects on touch (Material Design pattern)

**Visual feedback:**
- Toast notifications for actions (success/error/info)
- Optimistic UI updates (show change immediately, rollback on error)
- Progress indicators for multi-step processes
- Disabled state styling (reduced opacity, cursor-not-allowed)

**Layout enhancements:**
- Card hover effects (lift + shadow increase)
- Grid/list view toggles with smooth transitions
- Sticky headers that shrink on scroll
- Infinite scroll with "load more" sentinel
- Empty states with illustrations and CTAs

### Design Review Process

Before committing design changes:

1. **Visual QA** - Test on multiple screen sizes (mobile, tablet, desktop)
2. **Interaction QA** - Verify all hover, focus, active states
3. **Keyboard Navigation** - Tab through entire flow without mouse
4. **Performance Check** - Ensure 60fps animations, no layout shift
5. **Dark Mode** - If applicable, test dark theme variants
6. **Cross-browser** - Test on Chrome, Safari, Firefox at minimum

### Tools & Resources

**Available UI libraries:**
- HeadlessUI: `Transition`, `Dialog`, `Menu`, `Listbox`, `Popover`
- Radix UI: `Tooltip`, `DropdownMenu` (already installed)
- Lucide React: Consistent icon set, tree-shakeable

**Animation timing functions:**
- `ease: [0.4, 0, 0.2, 1]` - Default smooth (similar to ease-in-out)
- `ease: [0, 0, 0.2, 1]` - Ease out (good for entrances)
- `ease: [0.4, 0, 1, 1]` - Ease in (good for exits)
- `type: "spring"` - Natural, bouncy feel

**When to use which animation library:**
- Simple transitions: CSS (`transition-all duration-200`)
- Component animations: Framer Motion
- Complex scroll effects: GSAP with ScrollTrigger
- SVG animations: Framer Motion or GSAP

## Important Patterns

### Type Safety
- All API responses are typed with `APIResponse<T>` wrapper
- Component props should have explicit TypeScript interfaces
- Avoid `any` where possible; use `unknown` for truly dynamic data

### State Management
- Use Zustand stores for global state (auth, chat sessions, profile)
- Local component state with `useState` for UI-only state
- Avoid prop drilling - prefer Zustand selectors for deep component trees

### Error Handling
- API clients throw errors on `!success` response
- Components should use try-catch with user-friendly error messages
- 401 errors are handled automatically by `apiClientWithAuth`

### Styling
- Tailwind utility classes for all styling
- Avoid inline styles or CSS modules
- Custom global styles only in `globals.css`
- Component-specific styles should be colocated in same file with Tailwind

### SSR vs CSR
- Use SSR for SEO-critical content (post detail pages)
- Use CSR (Client Components) for interactive features (chat, editing)
- Mark client components with `'use client'` directive

## Key Files Reference

- `src/app/layout.tsx` - Root layout with `ClientAuthInit` for auth state
- `src/apis/apiClient.ts` - Auth retry logic and token refresh
- `src/store/ChatSessionStore.ts` - Chat session state and SSE integration
- `src/components/Chat/ChatWindow.tsx` - Main chat UI container
- `src/apis/aiApi.ts` - SSE stream parsing and event handlers
- `AGENTS.md` - Detailed API reference for all endpoints
- `ASK_SESSION_INTEGRATION.md` - AI session/history feature specification

## Testing Notes

No test framework is currently configured. When adding tests:
- Use Jest + React Testing Library
- Place tests adjacent to source files: `Component.test.tsx`
- Mock API calls using `apiClient` function spies
- Focus on critical paths: auth flow, chat session management, post CRUD

## Common Tasks

**Add a new API endpoint:**
1. Add function to appropriate `src/apis/*Api.ts` file
2. Use `apiClientWithAuth` or `apiClientNoAuth` based on auth requirement
3. Define TypeScript interface for request/response in `src/utils/types.ts`
4. Update `AGENTS.md` API reference section

**Create a new page:**
1. Add folder under `src/app/` with `page.tsx`
2. Use `'use client'` if interactive or needs hooks
3. Import layout components from `src/components/Layout/`

**Add chat event handler:**
1. Update event parsing in `askChatAPIV2` (src/apis/aiApi.ts)
2. Add callback to event handler interface
3. Wire callback in `ChatWindow` or consuming component
4. Update `ChatSessionStore` if state changes needed

**Improve component visual design:**
1. Identify the component file in `src/components/`
2. Review current Tailwind classes and layout
3. Apply design system principles (spacing, colors, shadows)
4. Add Framer Motion animations if appropriate
5. Test responsiveness at all breakpoints (mobile, tablet, desktop)
6. Verify accessibility (keyboard nav, focus states, ARIA labels)
7. Check dark mode if applicable

**Add micro-interactions:**
1. Choose animation library: CSS transitions (simple) or Framer Motion (complex)
2. Define animation variants for states (hover, active, loading)
3. Use appropriate easing curves and durations (150-300ms typical)
4. Test performance - ensure 60fps on low-end devices
5. Add reduced-motion media query support: `motion-reduce:transition-none`

**Refine existing UI without breaking functionality:**
1. Read component to understand props, state, and event handlers
2. Identify visual-only changes (colors, spacing, shadows, animations)
3. Make incremental changes, testing in browser after each
4. Preserve all `onClick`, `onChange`, state updates, and API calls
5. Test complete user flow to ensure nothing broke

## Documentation

- `AGENTS.md` - Complete API endpoint reference
- `ASK_SESSION_INTEGRATION.md` - AI chat session system design
- `TASK.md` - Project task tracking
- `springAPI.md` - Backend API documentation
