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

      {query && result?.plan && (
        <section className="mb-6 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-purple-50/60 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">검색 계획</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {result.plan.mode?.toUpperCase() || 'PLAN'}
              </h2>
              <p className="text-sm text-gray-600">
                {result.plan.hybrid?.enabled ? '하이브리드 검색 활성화' : '기본 검색 모드'}
                {result.plan.hybrid?.retrieval_bias ? ` · ${result.plan.hybrid.retrieval_bias}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-gray-700">
              {typeof result.plan.top_k === 'number' && (
                <span className="rounded-full bg-white/70 px-4 py-1 font-semibold shadow-sm">
                  Top-K {result.plan.top_k}
                </span>
              )}
              {typeof result.plan.threshold === 'number' && (
                <span className="rounded-full bg-white/70 px-4 py-1 font-semibold shadow-sm">
                  Threshold {result.plan.threshold}
                </span>
              )}
              {typeof result.plan.limit === 'number' && (
                <span className="rounded-full bg-white/70 px-4 py-1 font-semibold shadow-sm">
                  Limit {result.plan.limit}
                </span>
              )}
              {typeof result.plan.rewrites_len === 'number' && (
                <span className="rounded-full bg-white/70 px-4 py-1 font-semibold shadow-sm">
                  Rewrites {result.plan.rewrites_len}
                </span>
              )}
              {typeof result.plan.keywords_len === 'number' && (
                <span className="rounded-full bg-white/70 px-4 py-1 font-semibold shadow-sm">
                  Keywords {result.plan.keywords_len}
                </span>
              )}
            </div>
          </div>
          <dl className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
            {result.plan.weights && (
              <div className="rounded-2xl bg-white/70 p-3">
                <dt className="font-semibold text-gray-900">가중치</dt>
                <dd>
                  chunk {result.plan.weights.chunk ?? '-'} / title {result.plan.weights.title ?? '-'}
                </dd>
              </div>
            )}
            {result.plan.time && (
              <div className="rounded-2xl bg-white/70 p-3">
                <dt className="font-semibold text-gray-900">시간 범위</dt>
                <dd className="text-sm text-gray-700">
                  {result.plan.time.type || 'unknown'}
                  {result.plan.time.from ? ` · from ${result.plan.time.from}` : ''}
                  {result.plan.time.to ? ` · to ${result.plan.time.to}` : ''}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

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
            {categoryId != null && (
              <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                카테고리 #{categoryId}
              </span>
            )}
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
            <ul className="space-y-5">
              {result.posts.map(post => (
                <li
                  key={post.postId}
                  className="rounded-3xl border border-gray-100 bg-gradient-to-r from-white to-blue-50/50 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <Link
                        href={`/post/${post.postId}`}
                        className="text-2xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {post.postTitle}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 font-semibold">
                          점수 {post.score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/post/${post.postId}`}
                      className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
                    >
                      자세히 보기
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
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

        </>
      )}
    </div>
  );
}
