'use client';

import { useState, useEffect } from 'react';
import { useAuthStore, selectUserId } from '@/store/AuthStore';
import { getBlogById, BlogDetail, putPostView, putPostLike } from '@/apis/blogApi';

import { PostDetailHeader } from '@/components/PostDetail/Header';
import { PostDetailActions } from '@/components/PostDetail/Action';
import { PostDetailBody } from '@/components/PostDetail/Body';
import { PostNavbar } from '@/components/PostDetail/PostNavbar';
import { DraggableModal } from '@/components/Common/DraggableModal';
import { ChatViewButton } from '@/components/Chat/ChatViewButton';
import { ChatWindow } from '@/components/Chat/ChatWindow';

export default function PostDetailClient({ postId }: { postId: string }) {
  const authUserId = useAuthStore(selectUserId);

  const [post, setPost] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBlogById(Number(postId))
      .then(setPost)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [postId]);

  // 조회수 지연 증가
  useEffect(() => {
    if (!post) return;
    const timer = setTimeout(() => {
      void putPostView(post.id).catch(console.error);
    }, 30000);
    return () => clearTimeout(timer);
  }, [post]);

  const handleLike = async () => {
    if (!post) return;
    try {
      await putPostLike(post.id);
      if (liked) {
        setPost({ ...post, likeCount: post.likeCount - 1 });
        setLiked(false);
      } else {
        setPost({ ...post, likeCount: post.likeCount + 1 });
        setLiked(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <p className="text-center py-20">로딩 중…</p>;
  if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
  if (!post) return <p className="text-center py-20">게시글을 찾을 수 없습니다.</p>;

  const isMyPost = post.userId === authUserId;

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <PostDetailHeader post={post}>
        {isMyPost && <PostDetailActions postId={post.id} />} 
      </PostDetailHeader>
      <PostDetailBody content={post.content} />
    </div>
  )
}
