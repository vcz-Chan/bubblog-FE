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