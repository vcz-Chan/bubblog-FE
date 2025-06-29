// 인증 관련 서비스
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { apiClient } from './apiClient'

// 회원 가입
export async function signup({
  email,
  password,
  nickname,
  profileImageUrl,
}: {
  email: string;
  password: string;
  nickname: string;
  profileImageUrl: string;
}) {
  const res = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nickname, profileImageUrl }),
  });

  return await res.json(); // { success, code, message, data }
}


// 로그인
export async function login({ email, password }: { email: string; password: string }) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  return await res.json(); // { success, code, message, data: { accessToken, user } }
}

// 리프레쉬 토큰으로 재 로그인
export async function reissueToken() {
  const res = await fetch(`${BASE_URL}/api/auth/reissue`, {
    method: 'POST',
    credentials: 'include',
  });

  return await res.json(); // { success, code, message, data: { accessToken, user } }
}

// 로그아웃
export async function logout() {
  const res = await apiClient(`/api/auth/logout`, {
    method: 'POST'
  });

  return await res; // { success, code, message }
}