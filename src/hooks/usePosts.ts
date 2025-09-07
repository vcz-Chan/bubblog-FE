import { useState, useEffect, useCallback } from 'react';
import { getBlogsPage, Blog } from '@/apis/blogApi';
import { PageResponse } from '@/utils/types';
import { SORT_OPTIONS, SortOption } from '@/utils/constants';

interface UsePostsOptions {
  initialSort?: SortOption;
  pageSize?: number;
  isAuthenticated: boolean;
}

export function usePosts({
  initialSort = SORT_OPTIONS.LATEST,
  pageSize = 8,
  isAuthenticated,
}: UsePostsOptions) {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [pageData, setPageData] = useState<PageResponse<Blog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [page, setPage] = useState(0);

  const loadPage = useCallback(async (pageNum: number, currentSort = sort) => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getBlogsPage(pageNum, pageSize, currentSort);
      setPosts(data.content);
      setPageData(data);
      setPage(data.number);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pageSize, sort]);

  useEffect(() => {
    loadPage(0, sort);
  }, [isAuthenticated, sort, loadPage]);

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    setPage(0); // 정렬 변경 시 첫 페이지로
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && (!pageData || newPage < pageData.totalPages)) {
      loadPage(newPage);
    }
  };

  return {
    posts,
    pageData,
    loading,
    error,
    sort,
    page,
    handleSortChange,
    handlePageChange,
  };
}
