'use client';

import { useState, useEffect } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { PostList } from '@/components/Post/PostList';
import { BlogControls } from '@/components/Blog/BlogControls';
import { Bars3BottomLeftIcon } from '@heroicons/react/24/outline';
import Pagination from '@/components/Common/Pagination';

type ViewMode = 'card' | 'list';

export default function HomeClient() {
  const {
    posts,
    pageData,
    loading,
    error,
    sort,
    handleSortChange,
    handlePageChange,
  } = usePosts({});
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (isMobile) {
      setViewMode('card');
    }
  }, [isMobile]);

  if (loading || !pageData) {
    return <p className="text-center py-20">로딩 중…</p>;
  }

  if (error) {
    return <p className="text-center py-20 text-red-500">에러: {error}</p>;
  }

  const { number, totalPages, first, last } = pageData;

  return (
    <div className='w-full'>
      <main className="flex-1 w-full px-5 md:px-16 py-8">
        {/* 상단 컨트롤 UI */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 whitespace-nowrap shrink-0">
            <Bars3BottomLeftIcon className="hidden md:inline w-6 h-6" />
            <span className="hidden md:inline">게시글 모아보기</span>
          </h2>

          <BlogControls 
            sort={sort} 
            setSort={handleSortChange} 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
            showUserControls={false} 
            isViewModeToggleDisabled={isMobile}
          />
        </div>

        {/* 게시글 목록 */}
        <PostList posts={posts} viewMode={viewMode} />
      </main>

      <Pagination
        page={number}
        totalPages={totalPages}
        onChange={handlePageChange}
      />
    </div>
  );
}
