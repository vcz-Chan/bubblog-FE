import { aiFetch } from '@/apis/apiClient';

export interface ContextItem {
  post_id: string;
  post_title: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'bot';
  content: string;
}

// v2 검색 계획 타입(최소 서브셋, 유연성 유지)
export type SearchMode = 'rag' | 'post';
export interface SearchPlan {
  mode: SearchMode;
  top_k?: number;
  threshold?: number;
  weights?: { chunk?: number; title?: number };
  // v2 문서상 filters는 주로 time 기준만 노출됨(서버 내부 필터는 제외)
  filters?: {
    time?: { type: 'absolute' | 'relative'; from?: string; to?: string } | Record<string, unknown>;
  } | Record<string, unknown>;
  sort?: string;
  limit?: number;
  // hybrid 라벨 기반 retrieval_bias와 서버가 사용하는 alpha 동시 지원
  hybrid?: {
    enabled: boolean;
    retrieval_bias?: 'lexical' | 'balanced' | 'semantic';
    alpha?: number;
    max_rewrites?: number;
    max_keywords?: number;
  };
  // 플래너 실패 폴백 표시
  fallback?: boolean;
  rewrites?: string[];
  keywords?: string[];
}

// LLM 옵션(v1/v2 공통) — askV2.md 반영
export interface LLMRequest {
  provider?: 'openai' | 'gemini';
  model?: string;
  options?: { temperature?: number; top_p?: number; max_output_tokens?: number };
}

// 공통: 다양한 필드 케이스(postId/post_id 등)를 UI에서 쓰는 snake_case로 정규화
function normalizeContextArray(raw: any): ContextItem[] {
  if (!Array.isArray(raw)) return [];
  const pairs = raw
    .map((it: any) => {
      const id = it?.postId ?? it?.post_id ?? it?.id;
      const title = it?.postTitle ?? it?.post_title ?? it?.title;
      if (id == null || title == null) return null;
      return [String(id), { post_id: String(id), post_title: String(title) }] as const;
    })
    .filter(Boolean) as ReadonlyArray<readonly [string, ContextItem]>;
  return Array.from(new Map(pairs).values());
}

/**
 * AI 서버에 질문을 보내고 SSE 스트림을 처리합니다. (v1)
 */
export async function askChatAPI(
  question: string,
  userId: string,
  categoryId: number | null,
  personaId: number | -1,
  onContext: (items: ContextItem[]) => void,
  onAnswerChunk: (chunk: string) => void,
  options?: { postId?: number; llm?: LLMRequest; onExistInPostStatus?: (exists: boolean) => void }
): Promise<void> {
  const body: any = {
    question,
    user_id: userId,
    category_id: categoryId ?? null,
    speech_tone: personaId,
  };
  if (options?.postId != null) body.post_id = options.postId;
  if (options?.llm) body.llm = options.llm;

  const res = await aiFetch('/ai/ask', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'AI API error');
    return;
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let eventName = '';
  let contextDone = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop()!;

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
        continue;
      }
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (raw === '[DONE]' || eventName === 'end') {
        reader.cancel();
        return;
      }
      if (eventName === 'exist_in_post_status') {
        try {
          let exists: boolean | null = null;
          if (raw === 'true' || raw === 'false') {
            exists = raw === 'true';
          } else {
            const parsed = JSON.parse(raw);
            if (typeof parsed === 'boolean') exists = parsed;
          }
          if (exists != null) options?.onExistInPostStatus?.(exists);
        } catch {}
        eventName = '';
        continue;
      }
      if (eventName === 'context' && !contextDone) {
        try {
          const items = JSON.parse(raw);
          const normalized = normalizeContextArray(items);
          onContext(normalized);
          contextDone = true;
        } catch {}
        eventName = '';
        continue;
      }
      if (eventName === 'answer') {
        try {
          const s = JSON.parse(raw); // expect: JSON string
          if (typeof s === 'string' && s.length > 0) {
            onAnswerChunk(s);
          }
        } catch {
          // Ignore non-JSON-string chunks
        }
      }
      eventName = '';
    }
  }
}

// v2 핸들러 인터페이스
export interface AskV2Handlers {
  onSearchPlan?: (plan: SearchPlan) => void;
  onRewrites?: (rewrites: string[]) => void;
  onKeywords?: (keywords: string[]) => void;
  onHybridResult?: (items: ContextItem[]) => void;
  onSearchResult?: (items: ContextItem[]) => void;
  onExistInPostStatus?: (exists: boolean) => void;
  onContext?: (items: ContextItem[]) => void;
  onAnswerChunk?: (chunk: string) => void;
  onError?: (message: string, code?: number) => void;
}

/**
 * AI v2 서버에 질문을 보내고(\n/ai/v2/ask) 추가 이벤트를 처리합니다.
 */
export async function askChatAPIV2(
  question: string,
  userId: string,
  categoryId: number | null,
  personaId: number | -1,
  handlers: AskV2Handlers,
  options?: { postId?: number; llm?: LLMRequest }
): Promise<void> {
  const body: any = {
    question,
    user_id: userId,
    category_id: categoryId ?? null,
    speech_tone: personaId,
  };
  if (options?.postId != null) body.post_id = options.postId;
  if (options?.llm) body.llm = options.llm;

  const res = await aiFetch('/ai/v2/ask', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      const json = await res.json();
      if ((json as any)?.success === false) {
        handlers.onError?.((json as any)?.message || 'AI v2 API error', (json as any)?.code);
      }
    } catch {
      handlers.onError?.('AI v2 API error');
    }
    return;
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let eventName = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop()!;

    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
        continue;
      }
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();

      if (raw === '[DONE]' || eventName === 'end') {
        reader.cancel();
        return;
      }

      try {
        switch (eventName) {
          case 'search_plan': {
            const plan = JSON.parse(raw) as SearchPlan;
            handlers.onSearchPlan?.(plan);
            break;
          }
          case 'rewrite': {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) handlers.onRewrites?.(arr.filter((s) => typeof s === 'string'));
            break;
          }
          case 'keywords': {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) handlers.onKeywords?.(arr.filter((s) => typeof s === 'string'));
            break;
          }
          case 'hybrid_result': {
            const arr = JSON.parse(raw);
            handlers.onHybridResult?.(normalizeContextArray(arr));
            break;
          }
          case 'search_result': {
            const arr = JSON.parse(raw);
            handlers.onSearchResult?.(normalizeContextArray(arr));
            break;
          }
          case 'exist_in_post_status': {
            let exists: boolean | null = null;
            if (raw === 'true' || raw === 'false') {
              exists = raw === 'true';
            } else {
              const parsed = JSON.parse(raw);
              if (typeof parsed === 'boolean') exists = parsed;
            }
            if (exists != null) handlers.onExistInPostStatus?.(exists);
            break;
          }
          case 'context': {
            const arr = JSON.parse(raw);
            handlers.onContext?.(normalizeContextArray(arr));
            break;
          }
          case 'answer': {
            const s = JSON.parse(raw);
            if (typeof s === 'string' && s.length > 0) handlers.onAnswerChunk?.(s);
            break;
          }
          case 'error': {
            try {
              const err = JSON.parse(raw);
              if (err && typeof err === 'object') {
                handlers.onError?.((err as any).message || 'AI v2 error', (err as any).code);
              } else if (typeof err === 'string') {
                handlers.onError?.(err);
              }
            } catch {
              handlers.onError?.('AI v2 error');
            }
            break;
          }
          default:
            break;
        }
      } catch {
        // 개별 라인 파싱 오류는 무시(스트림 지속)
      }

      eventName = '';
    }
  }
}
