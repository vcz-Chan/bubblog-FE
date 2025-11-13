import { apiClientWithAuth, apiClientNoAuth } from './apiClient'
import { Comment, PageResponse } from '@/utils/types'

// 특정 게시물의 루트 댓글 목록 조회
export const getComments = (postId: string) => {
  return apiClientNoAuth<Comment[]>(`/api/posts/${postId}/comments`)
}

// 게시글 전체 댓글 수 조회
export const getCommentsCount = (postId: string) => {
  return apiClientNoAuth<number>(`/api/posts/${postId}/comments/count`)
}

// 대댓글 목록 조회
export const getChildComments = (commentId: number) => {
  return apiClientNoAuth<PageResponse<Comment>>(
    `/api/comments/${commentId}/children`,
  )
}

// 댓글 생성
export const createComment = ({
  postId,
  content,
  parentId,
}: {
  postId: string
  content: string
  parentId?: number | null
}) => {
  return apiClientWithAuth<Comment>('/api/posts/' + postId + '/comments', {
    method: 'POST',
    body: JSON.stringify({ content, parentId }),
  })
}

// 댓글 수정
export const updateComment = ({
  commentId,
  content,
}: {
  commentId: number
  content: string
}) => {
  return apiClientWithAuth<Comment>(`/api/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}

// 댓글 삭제
export const deleteComment = (commentId: number) => {
  return apiClientWithAuth<void>(`/api/comments/${commentId}`, {
    method: 'DELETE',
  })
}

// 댓글 좋아요 토글
export const toggleCommentLike = (commentId: number) => {
  return apiClientWithAuth<void>(`/api/comments/${commentId}/likes`, {
    method: 'POST',
  })
}
