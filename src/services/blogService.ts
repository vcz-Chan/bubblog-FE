// 블로그 글을 가져오고 생성, 수정, 삭제하는 서비스
import { apiClient } from './apiClient'
import { APIResponse, PageResponse } from '@/utils/types'

export interface Blog {
  id: number
  title: string
  summary: string
  thumbnailUrl: string
  createdAt: string
  viewCount: number,
  likeCount: number,
  userId: string
}

export interface BlogDetail extends Blog {
  content: string
  publicVisible: boolean
  categoryId: number
  nickname: string
  categoryList: string[]
}

export interface CreateBlogPayload {
  title: string
  summary: string
  content: string
  categoryId: number
  thumbnailUrl: string
  publicVisible: boolean
}

export interface UserPostsResponse {
  userId: string
  posts: Blog[]
}

// 유저별 게시글 페이징 응답 타입
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

// 전체 PageResponse를 그대로 반환
export async function getBlogsPage(
  page = 0,
  size = 8,
  sort = 'createdAt,DESC',
): Promise<PageResponse<Blog>> {
  const res: APIResponse<PageResponse<Blog>> = await apiClient('/api/blogs', {
    method: 'GET',
    params: { page, size, sort },
  })
  if (!res.success) {
    throw new Error(res.message)
  }
  return res.data!
}

// content만 가져오는 함수
export async function getBlogs(
  page = 0,
  size = 8,
  sort = 'createdAt,DESC',
): Promise<Blog[]> {
  const pageData = await getBlogsPage(page, size, sort)
  return pageData.content
}

// 아이디에 해당하는 글을 가져옴
export async function getBlogById(id: number): Promise<BlogDetail> {
  const res: APIResponse<BlogDetail> = await apiClient(`/api/blogs/${id}`, {
    method: 'GET',
  })
  if (!res.success) throw new Error(res.message)
  return res.data!
}

// 글을 생성
export async function createBlog(
  payload: CreateBlogPayload
): Promise<BlogDetail> {
  const res: APIResponse<BlogDetail> = await apiClient('/api/blogs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.success) throw new Error(res.message)
  return res.data!
}

// 글 수정
export async function updateBlog(
  id: number,
  payload: CreateBlogPayload
): Promise<BlogDetail> {
  const res: APIResponse<BlogDetail> = await apiClient(`/api/blogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  if (!res.success) throw new Error(res.message)
  return res.data!
}

// 글 삭제
export async function deleteBlog(id: number): Promise<void> {
  const res: APIResponse<null> = await apiClient(`/api/blogs/${id}`, {
    method: 'DELETE',
  })
  if (!res.success) throw new Error(res.message)
}

// 유저의 게시글을 페이지네이션으로 가져옴 (카테고리 필터 추가)
export async function getPostsByUserPage(
  userId: string,
  page = 0,
  size = 8,
  sort = 'createdAt,DESC',
  categoryId?: number | null,
): Promise<UserPostsPage<Blog>> {
  // 기본 params
  const params: Record<string, string | number> = { page, size, sort };
  // categoryId가 있으면 추가
  if (categoryId !== undefined && categoryId !== null) {
    params.categoryId = categoryId;
  }

  const res: APIResponse<UserPostsPage<Blog>> = await apiClient(
    `/api/blogs/users/${userId}`,
    {
      method: 'GET',
      params,
    }
  );
  if (!res.success) throw new Error(res.message);
  return res.data!;
}

// 유저의 게시글 중 content만 반환 (카테고리 필터 추가)
export async function getPostsByUserContent(
  userId: string,
  page = 0,
  size = 8,
  sort = 'createdAt,DESC',
  categoryId?: number,
): Promise<Blog[]> {
  const pageData = await getPostsByUserPage(
    userId,
    page,
    size,
    sort,
    categoryId,
  );
  return pageData.posts;
}

// 조회수 증가
export async function putPostView(postId: number): Promise<void> {
  await apiClient(`/api/blogs/${postId}/view`, {
    method: 'PUT',
  })
}

// 좋아요 증가
export async function putPostLike(postId: number): Promise<void> {
  await apiClient(`/api/blogs/${postId}/like`, {
    method: 'PUT',
  })
}