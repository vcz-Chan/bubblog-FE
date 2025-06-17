import { apiClient } from './apiClient'
import { APIResponse } from '@/utils/types'

export interface CategoryNode {
  id: number
  name: string
  children: CategoryNode[]
  root: boolean
}

export async function getCategoryTree(userId: string): Promise<CategoryNode[]> {
  const res: APIResponse<CategoryNode[]> = await apiClient(
    `/api/categories/${userId}/tree`,
    { method: 'GET' }
  )
  if (!res.success) throw new Error(res.message)
  return res.data!
}

export async function createCategory(payload: {
  name: string
  parentId?: number
}): Promise<CategoryNode> {
  const res: APIResponse<CategoryNode> = await apiClient('/api/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.success) throw new Error(res.message)
  return res.data!
}

export async function updateCategory(
  id: number,
  payload: { name?: string; newParentId?: number }
): Promise<CategoryNode> {
  const res: APIResponse<CategoryNode> = await apiClient(
    `/api/categories/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  )
  if (!res.success) throw new Error(res.message)
  return res.data!
}

export async function deleteCategory(id: number): Promise<void> {
  const res: APIResponse<null> = await apiClient(`/api/categories/${id}`, {
    method: 'DELETE',
  })
  if (!res.success) throw new Error(res.message)
}