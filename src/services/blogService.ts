// services/blogService.ts
import { apiClient } from './apiClient'
import { APIResponse, PageResponse } from '@/utils/types'

export interface Blog {
  id: number
  title: string
  summary: string
  thumbnailUrl: string
  createdAt: string
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

// 인기글을 가져옴 (배열만 반환)
export async function getBlogs(): Promise<Blog[]> {
  const res: APIResponse<PageResponse<Blog>> = await apiClient('/api/blogs', {
    method: 'GET',
  })
  if (!res.success) throw new Error(res.message)
  return res.data!.content
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

// 유저의 모든 글을 가져옴
export async function getPostsByUser(userId: string): Promise<Blog[]> {
  const res: APIResponse<UserPostsResponse> = await apiClient(
    `/api/blogs/users/${userId}`,
    { method: 'GET' }
  )
  if (!res.success) throw new Error(res.message)
  return res.data!.posts
}