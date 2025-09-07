'use client';

import { useAuthStore, selectIsLogin } from '@/store/AuthStore';
import { usePosts } from '@/hooks/usePosts';
import { SORT_OPTIONS, SortOption } from '@/utils/constants';
import { PostList } from '@/components/Post/PostList';
import { LandingPage } from '@/components/Home/LandingPage';
import {
  ChevronDownIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';

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

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (loading || !pageData) {
    return <p className="text-center py-20">로딩 중…</p>;
  }

  if (error) {
    return <p className="text-center py-20 text-red-500">에러: {error}</p>;
  }

  const { number, totalPages, first, last } = pageData;

  return (
    <div>
      <main className="flex-1 w-full px-5 md:px-16 py-8">
        {/* 상단 정렬 선택 UI */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            <Bars3BottomLeftIcon className="inline w-6 h-6 mr-2" />
            <p className='hidden md:inline'>게시글 모아보기</p>
          </h2>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="
                block w-full cursor-pointer appearance-none rounded-md border border-gray-300
                bg-white px-4 py-2 pr-10 text-sm text-gray-800 shadow-sm
                transition focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200
                hover:border-gray-400
              "
            >
              <option value={SORT_OPTIONS.LATEST}>최신순</option>
              <option value={SORT_OPTIONS.OLDEST}>오래된순</option>
              <option value={SORT_OPTIONS.TITLE_ASC}>제목순</option>
              <option value={SORT_OPTIONS.VIEWS}>조회순</option>
              <option value={SORT_OPTIONS.LIKES}>좋아요순</option>
            </select>

            {/* 커스텀 화살표 아이콘 */}
            <ChevronDownIcon
              className="
                pointer-events-none absolute right-3 top-1/2 h-5 w-5
                -translate-y-1/2 text-gray-400
              "
            />
          </div>
        </div>

        {/* 게시글 목록 */}
        <PostList posts={posts} />
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
