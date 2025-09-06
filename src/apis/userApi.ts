// src/domains/users/api.ts

import {
  apiClientNoAuth,
  apiClientWithAuth
} from '@/apis/apiClient';

export interface UserProfile {
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
}

/**
 * 1. 공개 프로필 조회 (인증 불필요)
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const res = await apiClientNoAuth<UserProfile>(
    `/api/users/${userId}`,
    { method: 'GET' }
  );
  return res.data!;
}

/**
 * 2. 내 정보 수정 (인증 필요)
 */
export async function updateUserProfile(params: {
  nickname: string;
  profileImageUrl: string;
}): Promise<UserProfile> {
  const res = await apiClientWithAuth<UserProfile>(
    `/api/users/me`,
    {
      method: 'PUT',
      body: JSON.stringify(params),
    }
  );
  return res.data!;
}

/**
 * 3. 내 계정 삭제 (인증 필요)
 */
export async function deleteUserAccount(): Promise<void> {
  await apiClientWithAuth<null>(
    `/api/users/me`,
    { method: 'DELETE' }
  );
}