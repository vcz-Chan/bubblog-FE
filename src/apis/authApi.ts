import {
  apiClientNoAuth,
  apiClientWithAuth,
} from '@/apis/apiClient';
import { APIResponse } from '@/utils/types';

export interface SignupPayload {
  email: string;
  password: string;
  nickname: string;
  profileImageUrl?: string;
}
export interface LoginPayload {
  email: string;
  password: string;
}
export interface AuthTokens {
  accessToken: string;
  userId: string;
    
}

/**
 * 1. 회원 가입 (인증 불필요)
 */
export async function signup(
  payload: SignupPayload
): Promise<APIResponse<null>> {
  return apiClientNoAuth<null>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * 2. 로그인 (인증 불필요, 쿠키 기반 세션 포함)
 */
export async function login(
  payload: LoginPayload
): Promise<APIResponse<AuthTokens>> {
  // credentials: 'include' 옵션은 apiClientNoAuth에 이미 설정되어 있습니다.
  return apiClientNoAuth<AuthTokens>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
} // { success, code, message, data: { accessToken, user } }

/**
 * 3. 리프레시 토큰으로 재발급 (인증 불필요, 쿠키 기반)
 */
export async function reissueToken(): Promise<APIResponse<AuthTokens>> {
  return apiClientNoAuth<AuthTokens>('/api/auth/reissue', {
    method: 'POST',
  });
}

/**
 * 4. 로그아웃 (Bearer JWT 필요)
 */
export async function logout(): Promise<APIResponse<null>> {
  return apiClientWithAuth<null>('/api/auth/logout', {
    method: 'POST',
  });
}