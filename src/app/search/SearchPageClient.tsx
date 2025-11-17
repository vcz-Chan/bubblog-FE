'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchHybrid, HybridSearchResponse } from '@/apis/searchApi';
import Pagination from '@/components/Common/Pagination';

interface SearchPageClientProps {
  query: string;
  page: number;
  categoryId: number | null;
}

const PAGE_SIZE = 10;

export default function SearchPageClient({ query, page, categoryId }: SearchPageClientProps) {
  const router = useRouter();
  const [input, setInput] = useState(query);
  const [result, setResult] = useState<HybridSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    if (!query) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    searchHybrid({
      question: query,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
      categoryId: categoryId ?? undefined,
      signal: controller.signal,
    })
      .then(res => {
        if (!controller.signal.aborted) {
          setResult(res);
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setError(err?.message || '검색 요청 실패');
          setResult(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [categoryId, page, query]);

  const updateUrl = useCallback(
    (nextQuery: string, nextPage = 0) => {
      const params = new URLSearchParams();
      if (nextQuery) params.set('query', nextQuery);
      if (categoryId != null) params.set('categoryId', String(categoryId));
      if (nextPage > 0) params.set('page', String(nextPage));
      router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
    },
    [categoryId, router]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    if (trimmed === query) return;
    updateUrl(trimmed, 0);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;
    updateUrl(query, nextPage);
  };

  const totalPages = useMemo(() => {
    if (!result) return 0;
    return Math.max(1, Math.ceil(result.total_posts / PAGE_SIZE));
  }, [result]);

  return (
    <div className="w-full max-w-5xl px-5 md:px-10 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">검색 결과</h1>
        <p className="text-gray-600">블로그 전체에서 원하는 게시글을 찾아보세요.</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 mb-8 bg-white rounded-2xl shadow px-5 py-4"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.currentTarget.value)}
          placeholder="검색어를 입력하세요"
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2 outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          disabled={!input.trim()}
        >
          검색
        </button>
      </form>

      {!query && (
        <div className="rounded-xl bg-gray-50 p-6 text-gray-600">
          검색어를 입력하면 Bubblog 전역에서 관련 게시글을 찾아드립니다.
        </div>
      )}

      {query && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-gray-600">
            <span>
              총 <strong>{result?.total_posts ?? 0}</strong>건
            </span>
            {result?.plan?.hybrid?.enabled && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                하이브리드 검색
              </span>
            )}
            {result?.plan?.mode && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                모드: {result.plan.mode}
              </span>
            )}
          </div>

          {loading && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow">
              검색 중입니다…
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && result && result.posts.length === 0 && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-gray-600 shadow">
              검색 결과가 없습니다. 다른 검색어를 시도해보세요.
            </div>
          )}

          {!loading && !error && result && result.posts.length > 0 && (
            <ul className="space-y-4">
              {result.posts.map(post => (
                <li
                  key={post.postId}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow hover:shadow-md transition-shadow"
                >
                  <Link
                    href={`/post/${post.postId}`}
                    className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {post.postTitle}
                  </Link>
                  <div className="mt-1 text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('ko-KR')} · 점수 {post.score.toFixed(2)}
                  </div>
                  {post.best?.snippet && (
                    <p className="mt-3 text-gray-700 break-words">{post.best.snippet}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {result && result.posts.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={handlePageChange}
              className="mt-8"
            />
          )}

          {result?.plan && (
            <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">검색 계획</h2>
              <dl className="grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
                {result.plan.hybrid && (
                  <div>
                    <dt className="font-medium text-gray-800">하이브리드</dt>
                    <dd>
                      {result.plan.hybrid.enabled ? '사용' : '미사용'}
                      {result.plan.hybrid.retrieval_bias && ` · ${result.plan.hybrid.retrieval_bias}`}
                    </dd>
                  </div>
                )}
                {typeof result.plan.top_k === 'number' && (
                  <div>
                    <dt className="font-medium text-gray-800">Top-K</dt>
                    <dd>{result.plan.top_k}</dd>
                  </div>
                )}
                {typeof result.plan.threshold === 'number' && (
                  <div>
                    <dt className="font-medium text-gray-800">Threshold</dt>
                    <dd>{result.plan.threshold}</dd>
                  </div>
                )}
                {result.plan.weights && (
                  <div>
                    <dt className="font-medium text-gray-800">가중치</dt>
                    <dd>
                      chunk {result.plan.weights.chunk ?? '-'} / title {result.plan.weights.title ?? '-'}
                    </dd>
                  </div>
                )}
                {result.plan.time && (
                  <div className="sm:col-span-2">
                    <dt className="font-medium text-gray-800">시간 범위</dt>
                    <dd>
                      {result.plan.time.type}{' '}
                      {result.plan.time.from ? `from ${result.plan.time.from}` : ''}{' '}
                      {result.plan.time.to ? `to ${result.plan.time.to}` : ''}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </>
      )}
    </div>
  );
}
