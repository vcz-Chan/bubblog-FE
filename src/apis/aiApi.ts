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

/**
 * AI 서버에 질문을 보내고 SSE 스트림을 처리합니다.
 */
export async function askChatAPI(
  question: string,
  userId: string,
  categoryId: number | null,
  personaId: number | -1,
  onContext: (items: ContextItem[]) => void,
  onAnswerChunk: (chunk: string) => void,
  options?: { postId?: number; onExistInPostStatus?: (exists: boolean) => void }
): Promise<void> {
  const body: any = {
    question,
    user_id: userId,
    category_id: categoryId ?? null,
    speech_tone: personaId,
  };
  if (options?.postId != null) body.post_id = options.postId;

  const res = await aiFetch('/ai/ask', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  // JSON 에러 페이로드 처리
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'AI API error');
    return;
  }

  // SSE 스트리밍 처리
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
            const items = JSON.parse(raw) as ContextItem[];
            const deduped = Array.from(
              new Map(items.map(i => [i.post_id, i])).values()
            );
            onContext(deduped);
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
            // Ignore: we only handle data lines that are a single JSON string
          }
        }
        eventName = '';
      }
    }
}
