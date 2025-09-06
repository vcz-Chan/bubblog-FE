import { useAuthStore } from '@/store/AuthStore';
import { APIResponse } from '@/utils/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL!;

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  retry?: boolean;
  params?: Record<string, string | number>;
}

/**
 * JWT 없이(인증 없이) 요청
 */
export async function apiClientNoAuth<T = any>(
  path: string,
  options: FetchOptions = {}
): Promise<APIResponse<T>> {
  const { params, ...init } = options;
  // url 생성(쿼리 파라미터 포함)
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, val]) =>
      url.searchParams.append(key, String(val))
    );
  }

  const res = await fetch(url.toString(), {
    ...init,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message);
  }
  return json;
}

/**
 * JWT를 포함한 요청 (토큰 만료 시 재발급 → 재시도)
 */
export async function apiClientWithAuth<T = any>(
  path: string,
  options: FetchOptions = {}
): Promise<APIResponse<T>> {
  const { retry = true, params, ...init } = options;

  // url 생성(쿼리 파라미터 포함)
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, val]) =>
      url.searchParams.append(key, String(val))
    );
  }

  // Access Token 헤더 추가 (Zustand 스토어 참조)
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // 서버로 요청
  const res = await fetch(url.toString(), {
    ...init,
    headers,
    credentials: 'include',
  });
  const json: APIResponse<T> = await res.json();

  // 401 에러 → reissue → 재시도
  if (!json.success && json.code === 401 && retry) {
    // 스토어를 통해 재발급 시도
    await useAuthStore.getState().reissue();
    const refreshed = useAuthStore.getState().accessToken;
    if (refreshed) {
      // 1회 재시도 (무한 루프 방지)
      return apiClientWithAuth<T>(path, { ...options, retry: false });
    } else {
      // 재발급 실패 → 안전 로그아웃
      await useAuthStore.getState().logout();
      return Promise.resolve({ success: false, code: 401, message: '인증이 필요합니다.', data: null });
    }
  }

  return json;
}

/**
 * JWT로 AI 서버에 요청 (토큰 만료 시 재발급 → 재시도) (sse를 위해 Response 반환)
 */
export async function aiFetch(
  path: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { retry = true, params, ...init } = options;
  const url = new URL(`${AI_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.append(k, String(v))
    );
  }

  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url.toString(), {
    ...init,
    headers,
  });

  // 토큰 만료 시 재발급 → 재시도
  if (res.status === 401 && retry) {
    await useAuthStore.getState().reissue();
    const refreshed = useAuthStore.getState().accessToken;
    if (refreshed) {
      return aiFetch(path, { ...options, retry: false });
    } else {
      await useAuthStore.getState().logout();
      return res;
    }
  }

  return res;
}