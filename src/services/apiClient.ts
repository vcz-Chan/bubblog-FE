// services/apiClient.ts
import { reissueToken, logout as logoutAPI } from './auth';
import { APIResponse } from '@/utils/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!;

interface FetchOptions extends Omit<RequestInit, 'headers'> {
  retry?: boolean;
  params?: Record<string, string | number>;
}

// api 요청을 처리(토큰 만료 처리 포함)
export async function apiClient<T = any>(
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

  // Access Token 헤더 추가
  const token = localStorage.getItem('accessToken');
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
    // 리프레시 토큰으로 재발급 시도
    const re = await reissueToken();
    if (re.success) {
      localStorage.setItem('accessToken', re.data.accessToken);
      // 재시도 (retry: false 로 무한루프 방지, 1회 재시도)
      return apiClient<T>(path, { ...options, retry: false });
    } else {
      // 재발급 실패 시 로그아웃 처리
      await logoutAPI();
      localStorage.removeItem('accessToken');
      return Promise.resolve({ success: false, code: 401, message: '인증이 필요합니다.', data: null });
    }
  }

  return json;
}