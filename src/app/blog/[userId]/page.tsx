'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, UserProfile } from '@/services/userService';
import { getPostsByUserPage, UserPostsPage, Blog, deleteBlog } from '@/services/blogService';
import { getCategoryTree, CategoryNode } from '@/services/categoryService';

import { UserProfileHeader } from '@/components/Blog/UserProfileHeader';
import { BlogControls } from '@/components/Blog/BlogControls';
import { CategoryFilterButton } from '@/components/Category/CategoryFilterButton';
import { CategorySelector } from '@/components/Category/CategorySelector';
import { PostsGrid } from '@/components/Blog/PostsGrid';
import { DeleteModal } from '@/components/Blog/DeleteModal';

export default function BlogPage() {
  const { userId: authUserId } = useAuth();
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const isMyBlog = paramUserId === authUserId;

  // --- 사용자 프로필 ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [errorUser, setErrorUser] = useState<string | null>(null);

  // --- 카테고리 ---
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [errorCats, setErrorCats] = useState<string | null>(null);

  // --- 게시글 페이지네이션 ---
  const [posts, setPosts] = useState<Blog[]>([]);
  const [pageData, setPageData] = useState<UserPostsPage<Blog> | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);

  // --- 정렬 · 페이지 · 카테고리 필터 상태 ---
  const [sort, setSort] = useState('createdAt,DESC');
  const [page, setPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);

  // --- 삭제 모달 상태 ---
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);

  const size = 6;

  // 프로필 로드
  useEffect(() => {
    if (!paramUserId) return;
    setLoadingUser(true);
    getUserProfile(paramUserId)
      .then(p => { setProfile(p); setErrorUser(null); })
      .catch(err => setErrorUser(err.message))
      .finally(() => setLoadingUser(false));
  }, [paramUserId]);

  // 카테고리 트리 로드
  useEffect(() => {
    if (!paramUserId) return;
    setLoadingCats(true);
    getCategoryTree(paramUserId)
      .then(tree => { setCategories(tree); setErrorCats(null); })
      .catch(err => setErrorCats(err.message))
      .finally(() => setLoadingCats(false));
  }, [paramUserId]);

  // 게시글 페이지 로드 함수
  const loadPostsPage = useCallback(async (pageNum: number) => {
    if (!paramUserId) return;
    setLoadingPosts(true);
    setErrorPosts(null);
    try {
      const data = await getPostsByUserPage(
        paramUserId,
        pageNum,
        size,
        sort,
        selectedCategory?.id ?? null
      );
      setPosts(data.posts);
      setPageData(data);
    } catch (err: any) {
      setErrorPosts(err.message);
    } finally {
      setLoadingPosts(false);
    }
  }, [paramUserId, sort, selectedCategory]);

  // 정렬·카테고리·유저 변경 시 첫 페이지부터 로드
  useEffect(() => {
    setPage(0);
    loadPostsPage(0);
  }, [paramUserId, sort, selectedCategory, loadPostsPage]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadPostsPage(newPage);
  };

  // 삭제 핸들러
  const handleDelete = (id: number) => {
    const t = posts.find(p => p.id === id) ?? null;
    setDeleteTarget(t);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBlog(deleteTarget.id);
    } catch {
      alert('삭제에 실패했습니다.');
    }
    setPosts(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // --- 렌더링 ---
  if (loadingUser) return <p>프로필 로딩 중…</p>;
  if (errorUser)  return <p className="text-red-500">{errorUser}</p>;

   return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between'>
        {profile && <UserProfileHeader profile={profile} isMyBlog={isMyBlog} />}
        {isMyBlog && <BlogControls userId={paramUserId} />}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CategoryFilterButton
          selectedCategory={selectedCategory}
          onOpen={() => setIsCatModalOpen(true)}
        />
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="createdAt,DESC">🆕 최신순</option>
            <option value="createdAt,ASC">📜 오래된순</option>
            <option value="title,ASC">🔤 가나다순</option>
          </select>
        </div>
      </div>

      {loadingPosts ? (
        <p className="text-center">로딩 중…</p>
      ) : errorPosts ? (
        <p className="text-center text-red-500">{errorPosts}</p>
      ) : (
        <>
          <PostsGrid posts={posts} isMyBlog={isMyBlog} onDelete={handleDelete} />

          {/* 페이지네이션 */}
          {pageData && (
            <nav className="py-4 flex justify-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                이전
              </button>
              {Array.from({ length: pageData.totalPages }, (_, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePageChange(idx)}
                  className={`px-3 py-1 border rounded ${
                    idx === page ? 'font-bold underline text-blue-600' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={pageData.last}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                다음
              </button>
            </nav>
          )}
        </>
      )}

      <DeleteModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.title}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <CategorySelector
        userId={paramUserId!}
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
}