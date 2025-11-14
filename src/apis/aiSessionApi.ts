import { aiFetch } from '@/apis/apiClient';
import {
  ChatSession,
  ChatSessionListResponse,
  ChatSessionMessagesResponse,
} from '@/utils/types';

const DEFAULT_ERROR = 'AI 세션 API 호출 중 오류가 발생했습니다.';

function buildParams(source: Record<string, string | number | null | undefined>) {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== undefined && value !== null)
  ) as Record<string, string | number>;
}

async function parseJson<T>(res: Response, fallbackMessage: string): Promise<T> {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = (data && (data.message || data.error || data.reason)) || fallbackMessage;
    throw new Error(message);
  }
  return data as T;
}

export interface GetChatSessionsParams {
  limit?: number;
  cursor?: string | null;
  ownerUserId?: string;
}

export async function getChatSessions(params: GetChatSessionsParams = {}): Promise<ChatSessionListResponse> {
  const query = buildParams({
    limit: params.limit,
    cursor: params.cursor,
    owner_user_id: params.ownerUserId,
  });

  const res = await aiFetch('/ai/v2/sessions', {
    method: 'GET',
    params: query,
  });
  return parseJson<ChatSessionListResponse>(res, DEFAULT_ERROR);
}

export async function getChatSession(sessionId: number): Promise<ChatSession> {
  const res = await aiFetch(`/ai/v2/sessions/${sessionId}`, {
    method: 'GET',
  });
  return parseJson<ChatSession>(res, DEFAULT_ERROR);
}

export interface GetChatSessionMessagesParams {
  limit?: number;
  cursor?: string | null;
  direction?: 'forward' | 'backward';
}

export async function getChatSessionMessages(
  sessionId: number,
  params: GetChatSessionMessagesParams = {}
): Promise<ChatSessionMessagesResponse> {
  const query = buildParams({
    limit: params.limit,
    cursor: params.cursor,
    direction: params.direction,
  });

  const res = await aiFetch(`/ai/v2/sessions/${sessionId}/messages`, {
    method: 'GET',
    params: query,
  });
  return parseJson<ChatSessionMessagesResponse>(res, DEFAULT_ERROR);
}
