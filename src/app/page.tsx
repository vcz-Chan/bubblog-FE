'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, selectIsLogin } from '@/store/AuthStore';
import { usePosts } from '@/hooks/usePosts';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SortOption } from '@/utils/constants';
import { PostList } from '@/components/Post/PostList';
import { LandingPage } from '@/components/Home/LandingPage';
import { BlogControls } from '@/components/Blog/BlogControls';
import {
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';

type ViewMode = 'card' | 'list';

export default function Home() {
  const isAuthenticated = useAuthStore(selectIsLogin);
  const {
    posts,
    pageData,
    loading,
    error,
    sort,
    handleSortChange,
    handlePageChange,
  } = usePosts({ isAuthenticated });
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const isMobile = useMediaQuery('(max-width: 768px)');

  // 모바일 사이즈일 때 카드 뷰로 강제
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

      {/* 페이지네이션 */}
      <nav className="py-4 flex justify-center space-x-2">
        <button
          onClick={() => handlePageChange(number - 1)}
          disabled={first}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          이전
        </button>

        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx}
            onClick={() => handlePageChange(idx)}
            className={`px-3 py-1 border rounded ${
              idx === number ? 'font-bold underline text-blue-600' : ''
            }`}
          >
            {idx + 1}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(number + 1)}
          disabled={last}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          다음
        </button>
      </nav>
    </div>
  );
}

