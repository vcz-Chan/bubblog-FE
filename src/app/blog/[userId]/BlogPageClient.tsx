'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore, selectUserId } from '@/store/AuthStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getUserProfile, UserProfile } from '@/apis/userApi';
import { getPostsByUserPage, UserPostsPage, Blog, deleteBlog } from '@/apis/blogApi';
import { getCategoryTree, CategoryNode } from '@/apis/categoryApi';
import { SORT_OPTIONS, SortOption } from '@/utils/constants';

import { UserProfileHeader } from '@/components/Blog/UserProfileHeader';
import { BlogControls } from '@/components/Blog/BlogControls';
import { CategoryFilterButton } from '@/components/Category/CategoryFilterButton';
import { CategorySelector } from '@/components/Category/CategorySelector';
import { PostsGrid } from '@/components/Blog/PostsGrid';
import { DeleteModal } from '@/components/Blog/DeleteModal';
import { DraggableModal } from '@/components/Common/DraggableModal'
import { ChatWindow } from '@/components/Chat/ChatWindow'
import { ChatViewButton } from '@/components/Chat/ChatViewButton'
import Pagination from '@/components/Common/Pagination'

type ViewMode = 'card' | 'list';

export default function BlogPageClient() {
  const authUserId = useAuthStore(selectUserId);
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const isMyBlog = paramUserId === authUserId;
  const isMobile = useMediaQuery('(max-width: 768px)');

  // --- 상태 관리 ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [posts, setPosts] = useState<Blog[]>([]);
  const [pageData, setPageData] = useState<UserPostsPage<Blog> | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [errorUser, setErrorUser] = useState<string | null>(null);
  const [loadingCats, setLoadingCats] = useState(false);
  const [errorCats, setErrorCats] = useState<string | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);
  
  // --- 필터, 모달, 뷰 상태 ---
  const [sort, setSort] = useState<SortOption>(SORT_OPTIONS.LATEST);
  const [page, setPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const size = 8;

  // 모바일 사이즈일 때 카드 뷰로 강제
  useEffect(() => {
    if (isMobile) {
      setViewMode('card');
    }
  }, [isMobile]);

  // 프로필 로드
  useEffect(() => {
    if (!paramUserId) return;
    setLoadingUser(true);
    getUserProfile(paramUserId)
      .then(p => { setProfile(p); setErrorUser(null); })
      .catch(err => {
        if (err instanceof Error) setErrorUser(err.message);
        else setErrorUser('알 수 없는 오류가 발생했습니다.');
      })
      .finally(() => setLoadingUser(false));
  }, [paramUserId]);

  // 카테고리 트리 로드
  useEffect(() => {
    if (!paramUserId) return;
    setLoadingCats(true);
    getCategoryTree(paramUserId)
      .then(tree => { setCategories(tree); setErrorCats(null); })
      .catch(err => {
        if (err instanceof Error) setErrorCats(err.message);
        else setErrorCats('알 수 없는 오류가 발생했습니다.');
      })
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
    } catch (err) {
      if (err instanceof Error) {
        setErrorPosts(err.message);
      } else {
        setErrorPosts('알 수 없는 오류가 발생했습니다.');
      }
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
    <div className='w-full'>
      <main className="flex-1 w-full px-5 md:px-16 py-8">

        <div className='flex flex-col lg:flex-row gap-4 items-center justify-between'>
          <div className='flex flex-row gap-4 items-center justify-between'>
            {profile && <UserProfileHeader profile={profile} isMyBlog={isMyBlog} />}
            <ChatViewButton userId={paramUserId} variant="blog" onClick={() => setShowChat(true)}/>
          </div>
          {showChat && (
            <DraggableModal
              path= {`/chatbot/${paramUserId}`}
              onClose={() => setShowChat(false)}
            >
              <ChatWindow userId={paramUserId} />
            </DraggableModal>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between my-4">
          <CategoryFilterButton
            selectedCategory={selectedCategory}
            onOpen={() => setIsCatModalOpen(true)}
          />
          <BlogControls
            userId={paramUserId}
            sort={sort}
            setSort={setSort}
            viewMode={viewMode}
            setViewMode={setViewMode}
            isViewModeToggleDisabled={isMobile}
            showUserControls={isMyBlog}
          />
        </div>

        {loadingPosts ? (
          <p className="text-center">로딩 중…</p>
        ) : errorPosts ? (
          <p className="text-center text-red-500">{errorPosts}</p>
        ) : (
          <>
            <PostsGrid posts={posts} viewMode={viewMode} />

            {pageData && (
              <Pagination
                page={page}
                totalPages={pageData.totalPages}
                onChange={handlePageChange}
              />
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
      </main>
    </div>
  );
}
