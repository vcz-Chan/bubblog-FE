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

// ASK 세션 및 메시지 타입
export interface ChatSession {
  session_id: number
  owner_user_id: string
  requester_user_id: string
  title: string | null
  metadata?: Record<string, unknown> | null
  last_question_at: string | null
  created_at: string
  updated_at: string
  message_count: number
}

export interface ChatSessionPaging {
  cursor: string | null
  has_more: boolean
  direction?: 'forward' | 'backward'
  next_cursor?: string | null
}

export interface ChatSessionListResponse {
  sessions: ChatSession[]
  paging: ChatSessionPaging
}

export type ChatSessionMessageRole = 'user' | 'assistant'

export interface ChatSessionMessage {
  id: number
  session_id: number
  role: ChatSessionMessageRole
  content: string
  search_plan?: Record<string, unknown> | null
  retrieval_meta?: Record<string, unknown> | null
  created_at: string
}

export interface ChatSessionMessagesResponse {
  session_id: number
  owner_user_id: string
  requester_user_id: string
  messages: ChatSessionMessage[]
  paging: {
    direction: 'forward' | 'backward'
    has_more: boolean
    next_cursor: string | null
  }
}
