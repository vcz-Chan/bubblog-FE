export interface ContextItem {
  post_id: string
  post_title: string
  post_chunk: string
}

export interface ChatMessage {
  id: number
  role: 'user' | 'bot'
  content: string
}

// SSE 파싱 콜백을 인자로 받는 함수
export async function askChat(
  question: string,
  userId: string,
  categoryId: number | null,
  onContext: (items: ContextItem[]) => void,
  onAnswerChunk: (chunk: string) => void
): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_AI_API_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, user_id: userId, category_id: categoryId?.toString() ?? null }),
  });
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
      const raw = line.slice(5);

      if (raw.trim() === '[DONE]' || eventName === 'end') {
        reader.cancel();
        return;
      }

      if (eventName === 'context' && !contextDone) {
        const txt = raw.trim();
        if (txt.startsWith('[')) {
          try {
            const items = JSON.parse(txt) as ContextItem[];
            onContext(items);
            contextDone = true;
          } catch {}
        }
        eventName = '';
        continue;
      }

      if (eventName === 'answer') {
        let chunk = raw.trim().replace(/^'+|'+$/g, '');
        const t = chunk.trim();
        if (['{"', '}', 'text', '":"'].includes(t)) chunk = '';
        else if (t === '\\"') chunk = ' " ';
        onAnswerChunk(chunk);
      }
      eventName = '';
    }
  }
}