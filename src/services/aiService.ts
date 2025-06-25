// ai서버에 질문을 보내고 답변을 받는 서비스
// 토큰 만료시 재발급 후 재시도
import { reissueToken, logout as logoutAPI } from './auth';

export interface ContextItem {
  post_id: string
  post_title: string
}

export interface ChatMessage {
  id: number
  role: 'user' | 'bot'
  content: string
}

export async function askChat(
  question: string,
  userId: string,
  categoryId: number | null,
  personaId: number | -1, 
  onContext: (items: ContextItem[]) => void,
  onAnswerChunk: (chunk: string) => void,
  retry = true  // 재시도 가능 여부 플래그
): Promise<void> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_AI_API_URL}/ai/ask`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        question,
        user_id: userId,
        category_id: categoryId ?? null,
        speech_tone: personaId,
      }),
    }
  );

  // HTTP 401 처리 (토큰 만료) 
  if (res.status === 401 && retry) {
    // 리프레시 토큰으로 재발급 시도
    const re = await reissueToken();
    if (re.success) {
      localStorage.setItem('accessToken', re.data.accessToken);
      // 한 번만 재시도
      return askChat(
        question,
        userId,
        categoryId,
        personaId,  
        onContext,
        onAnswerChunk,
        false
      );
    } else {
      // 재발급 실패 → 로그아웃
      await logoutAPI();
      localStorage.removeItem('accessToken');
      return;  // 혹은 에러 처리
    }
  }

  // JSON 에러 페이로드 처리 (SSE 대신 JSON 에러 반환하는 경우)
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    if (!json.success && json.code === 401 && retry) {
      // 위와 동일한 재발급 로직
      const re = await reissueToken();
      if (re.success) {
        localStorage.setItem('accessToken', re.data.accessToken);
        return askChat(
          question,
          userId,
          categoryId,
          personaId,
          onContext,
          onAnswerChunk,
          false
        );
      } else {
        await logoutAPI();
        localStorage.removeItem('accessToken');
        return;
      }
    }
    // 다른 JSON 오류 처리
    throw new Error(json.message || 'API error');
  }

  // 정상 SSE 스트리밍 처리 
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
        const chunk = raw.replace(/^'+|'+$/g, '');
        const t = chunk.trim();
        if (!['{"', '}', 'text', '":"', '\\"'].includes(t)) {
          onAnswerChunk(chunk === '\\"' ? ' "' : chunk);
        }
      }
      eventName = '';
    }
  }
}