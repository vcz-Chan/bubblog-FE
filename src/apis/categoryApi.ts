import {
  apiClientWithAuth
} from '@/apis/apiClient';

export interface CategoryNode {
  id: number;
  name: string;
  children: CategoryNode[];
  root: boolean;
}

/**
 * 1. 카테고리 트리 조회 (인증 필요)
 */
export async function getCategoryTree(userId: string): Promise<CategoryNode[]> {
  const res = await apiClientWithAuth<CategoryNode[]>(
    `/api/categories/${userId}/tree`,
    { method: 'GET' }
  );
  return res.data!;
}

/**
 * 2. 카테고리 생성 (인증 필요)
 */
export async function createCategory(payload: {
  name: string;
  parentId?: number;
}): Promise<CategoryNode> {
  const res = await apiClientWithAuth<CategoryNode>(
    '/api/categories',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  return res.data!;
}

/**
 * 3. 카테고리 수정 (인증 필요)
 */
export async function updateCategory(
  id: number,
  payload: { name?: string; newParentId?: number }
): Promise<CategoryNode> {
  const res = await apiClientWithAuth<CategoryNode>(
    `/api/categories/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  );
  return res.data!;
}

/**
 * 4. 카테고리 삭제 (인증 필요)
 */
export async function deleteCategory(id: number): Promise<void> {
  await apiClientWithAuth<null>(
    `/api/categories/${id}`,
    { method: 'DELETE' }
  );
}