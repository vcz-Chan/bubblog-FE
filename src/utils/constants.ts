/**
 * 정렬 옵션
 */
export const SORT_OPTIONS = {
  LATEST: 'createdAt,DESC',
  OLDEST: 'createdAt,ASC',
  TITLE_ASC: 'title,ASC',
  VIEWS: 'viewCount,DESC',
  LIKES: 'likeCount,DESC',
} as const;

/**
 * 정렬 옵션 값들의 유니온 타입
 */
export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];

/**
 * 페이지네이션
 */
export const DEFAULT_PAGE_SIZE = 9;
