'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBlogsPage, Blog } from '@/services/blogService';
import { PageResponse } from '@/utils/types';
import { PostList } from '@/components/Post/PostList';
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const [posts, setPosts] = useState<Blog[]>([]);
  const [pageData, setPageData] = useState<PageResponse<Blog> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState('createdAt,DESC');

  const size = 6;

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
    return <p className="text-center py-20">로그인이 필요합니다.</p>;
  }
  if (loading || !pageData) {
    return <p className="text-center py-20">로딩 중…</p>;
  }
  if (error) {
    return <p className="text-center py-20 text-red-500">에러: {error}</p>;
  }

  const { content, number, totalPages, first, last } = pageData;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <main className="flex-1 w-full px-5 md:px-16 py-8">
        {/* 상단 정렬 선택 UI */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            <Bars3BottomLeftIcon className="inline w-6 h-6 text-blue-500 mr-2" />
            <p className='hidden md:inline'>게시글 모아보기</p>
          </h2>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => {
                const selected = e.target.value;
                setSort(selected);
                loadPage(0, selected);
              }}
              className="block appearance-none w-48 px-3 py-2 pr-8 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
            >
              <option value="createdAt,DESC">🔽 최신순</option>
              <option value="createdAt,ASC">🔼 오래된순</option>
              <option value="title,ASC">🔠 제목순</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-600">
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
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