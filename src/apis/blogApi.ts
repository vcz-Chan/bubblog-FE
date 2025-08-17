import {
  apiClientNoAuth,
  apiClientWithAuth,
} from '@/apis/apiClient';
import { APIResponse, PageResponse } from '@/utils/types';

export interface Blog {
  id: number;
  title: string;
  summary: string;
  thumbnailUrl: string;
  createdAt: string;
  viewCount: number;
  likeCount: number;
  userId: string;
}

export interface BlogDetail extends Blog {
  content: string;
  publicVisible: boolean;
  categoryId: number;
  nickname: string;
  categoryList: string[];
}

export interface CreateBlogPayload {
  title: string;
  summary: string;
  content: string;
  categoryId: number;
  thumbnailUrl: string;
  publicVisible: boolean;
}

export interface UserPostsPage<T> {
  userId: string;
  nickname: string;
  posts: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ────────────────────────────────────────────────────────────
// 인증 없이 불러오는 함수들
// ────────────────────────────────────────────────────────────

export async function getBlogsPage(
  page = 0,
  size = 8,
  sort = 'createdAt,DESC',
): Promise<PageResponse<Blog>> {
  const res = await apiClientNoAuth<PageResponse<Blog>>(
    '/api/blogs',
    { method: 'GET', params: { page, size, sort } }
  );
  if (!res.success) throw new Error(res.message);
  return res.data!;
}

export async function getBlogs(
  page = 0,
  size = 8,
  sort = 'createdAt,DESC',
): Promise<Blog[]> {
  const { content } = await getBlogsPage(page, size, sort);
  return content;
}

export async function getBlogById(
  id: number
): Promise<BlogDetail> {
  const res = await apiClientNoAuth<BlogDetail>(
    `/api/blogs/${id}`,
    { method: 'GET' }
  );
  if (!res.success) throw new Error(res.message);
  return res.data!;
}

// ────────────────────────────────────────────────────────────
// JWT 인증이 필요한 함수들
// ────────────────────────────────────────────────────────────

export async function createBlog(
  payload: CreateBlogPayload
): Promise<BlogDetail> {
  const res = await apiClientWithAuth<BlogDetail>(
    '/api/blogs',
    { method: 'POST', body: JSON.stringify(payload) }
  );
  if (!res.success) throw new Error(res.message);
  return res.data!;
}

export async function updateBlog(
  id: number,
  payload: CreateBlogPayload
): Promise<BlogDetail> {
  const res = await apiClientWithAuth<BlogDetail>(
    `/api/blogs/${id}`,
    { method: 'PUT', body: JSON.stringify(payload) }
  );
  if (!res.success) throw new Error(res.message);
  return res.data!;
}

export async function deleteBlog(
  id: number
): Promise<void> {
  const res = await apiClientWithAuth<null>(
    `/api/blogs/${id}`,
    { method: 'DELETE' }
  );
  if (!res.success) throw new Error(res.message);
}

export async function getPostsByUserPage(
  userId: string,
  page = 0,
  size = 8,
  sort = 'createdAt,DESC',
  categoryId?: number | null,
): Promise<UserPostsPage<Blog>> {
  const params: Record<string, string | number> = { page, size, sort };
  if (categoryId != null) params.categoryId = categoryId;

  const res = await apiClientWithAuth<UserPostsPage<Blog>>(
    `/api/blogs/users/${userId}`,
    { method: 'GET', params }
  );
  if (!res.success) throw new Error(res.message);
  return res.data!;
}

export async function getPostsByUserContent(
  userId: string,
  page = 0,
  size = 8,
  sort = 'createdAt,DESC',
  categoryId?: number,
): Promise<Blog[]> {
  const pageData = await getPostsByUserPage(
    userId, page, size, sort, categoryId
  );
  return pageData.posts;
}

export async function putPostView(
  postId: number
): Promise<void> {
  const res = await apiClientWithAuth<null>(
    `/api/blogs/${postId}/view`,
    { method: 'PUT' }
  );
  if (!res.success) throw new Error(res.message);
}

export async function putPostLike(
  postId: number
): Promise<void> {
  const res = await apiClientWithAuth<null>(
    `/api/blogs/${postId}/like`,
    { method: 'PUT' }
  );
  if (!res.success) throw new Error(res.message);
}