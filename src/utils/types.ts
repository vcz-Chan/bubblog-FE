export interface APIResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data: T | null;
}

// 페이징 API 응답 타입
export interface PageResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: { empty: boolean; unsorted: boolean; sorted: boolean }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  first: boolean
  size: number
  number: number
  sort: { empty: boolean; unsorted: boolean; sorted: boolean }
  numberOfElements: number
  empty: boolean
}

// 댓글 API 응답 타입
export interface Comment {
  id: number
  content: string
  deleted: boolean
  writerNickname: string
  writerProfileImage: string | null
  likeCount: number
  createdAt: string
  updatedAt: string | null
  parentId: number | null
  replyCount: number | null
  children?: Comment[] // 대댓글을 저장하기 위한 선택적 필드
}