import { apiClient } from './apiClient'
import { APIResponse } from '@/utils/types'

export interface UserProfile {
  userId: string
  nickname: string
  profileImageUrl: string | null
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const res: APIResponse<UserProfile> = await apiClient(
    `/api/users/${userId}`,
    { method: 'GET' }
  )
  if (!res.success) {
    throw new Error(res.message)
  }
  return res.data!
}

export async function updateUserProfile(params: {
  nickname: string
  profileImageUrl: string
}): Promise<UserProfile> {
  const res: APIResponse<UserProfile> = await apiClient(
    `/api/users/me`,
    {
      method: 'PUT',
      body: JSON.stringify(params),
    }
  )
  if (!res.success) {
    throw new Error(res.message)
  }
  return res.data!
}

export async function deleteUserAccount(): Promise<void> {
  const res: APIResponse<null> = await apiClient(
    `/api/users/me`,
    { method: 'DELETE' }
  )
  if (!res.success) {
    throw new Error(res.message)
  }
}