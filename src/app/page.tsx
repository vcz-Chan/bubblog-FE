'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBlogsPage, Blog } from '@/services/blogService';
import { PageResponse } from '@/utils/types';
import { PostList } from '@/components/Post/PostList';
import { LandingPage } from '@/components/Home/LandingPage'
import {
  ChevronDownIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const [posts, setPosts] = useState<Blog[]>([]);
  const [pageData, setPageData] = useState<PageResponse<Blog> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState('createdAt,DESC');

  const size = 8;

  const loadPage = async (pageNum: number, currentSort = sort) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBlogsPage(pageNum, size, currentSort);
      setPosts(data.content);
      setPageData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩 및 정렬 조건 변경 시
  useEffect(() => {
    if (isAuthenticated) {
      loadPage(0, sort);
    }
  }, [isAuthenticated, sort]);

  if (!isAuthenticated) {
    return <LandingPage/>;
  }
  if (loading || !pageData) {
    return <p className="text-center py-20">로딩 중…</p>;
  }
  if (error) {
    return <p className="text-center py-20 text-red-500">에러: {error}</p>;
  }

  const { content, number, totalPages, first, last } = pageData;

  return (
    <div >
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
              onChange={(e) => {
                const selected = e.target.value
                setSort(selected)
                loadPage(0, selected)
              }}
              className="
                block w-full cursor-pointer appearance-none rounded-md border border-gray-300
                bg-white px-4 py-2 pr-10 text-sm text-gray-800 shadow-sm
                transition focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200
                hover:border-gray-400
              "
            >
              <option value="createdAt,DESC">최신순</option>
              <option value="createdAt,ASC">오래된순</option>
              <option value="title,ASC">제목순</option>
              <option value="viewCount,DESC">조회순</option>
              <option value="likeCount,DESC">좋아요순</option>
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
        <PostList posts={content} />
      </main>

      {/* 페이지네이션 */}
      <nav className="py-4 flex justify-center space-x-2">
        <button
          onClick={() => loadPage(number - 1)}
          disabled={first}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          이전
        </button>

        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx}
            onClick={() => loadPage(idx)}
            className={`px-3 py-1 border rounded ${
              idx === number ? 'font-bold underline text-blue-600' : ''
            }`}
          >
            {idx + 1}
          </button>
        ))}

        <button
          onClick={() => loadPage(number + 1)}
          disabled={last}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          다음
        </button>
      </nav>
    </div>
  );
}