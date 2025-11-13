'use client';

import { useState } from 'react'
import Image from 'next/image'
import { Comment } from '@/utils/types'
import { useProfileStore } from '@/store/ProfileStore'
import { updateComment, deleteComment, toggleCommentLike, getChildComments } from '@/apis/commentApi'
import CommentForm from './CommentForm'

// Helper function for relative time
function timeAgo(date: string): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "년 전";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "달 전";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "일 전";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "시간 전";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "분 전";
  return "방금 전";
}

interface CommentItemProps {
  postId: string
  comment: Comment
  onCommentUpdate: (updatedComment: Comment) => void
  onCommentDelete: (commentId: number, replyCount: number) => void
  onReplyCreated: () => void
  isReply?: boolean // 대댓글 여부를 나타내는 prop
}

export default function CommentItem({ 
  postId,
  comment,
  onCommentUpdate,
  onCommentDelete,
  onReplyCreated,
  isReply = false, // 기본값은 false (루트 댓글)
}: CommentItemProps) {
  const { nickname, isLoading } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)

  const [likeCount, setLikeCount] = useState(comment.likeCount)
  // useState의 lazy initializer를 사용하여 클라이언트에서만 localStorage에 접근
  const [isLiked, setIsLiked] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return localStorage.getItem(`liked-comment-${comment.id}`) === 'true';
  });

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [childComments, setChildComments] = useState<Comment[]>([]);
  const [showChildren, setShowChildren] = useState(false);

  const isAuthor = !isLoading && nickname === comment.writerNickname;

  const handleUpdate = async () => {
    if (!editedContent.trim()) return
    try {
      const response = await updateComment({ commentId: comment.id, content: editedContent })
      if (response.success && response.data) {
        onCommentUpdate(response.data)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating comment:', error)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      try {
        await deleteComment(comment.id);
        onCommentDelete(comment.id, comment.replyCount || 0);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleLike = async () => {
    if (!nickname) { // isLogin 대신 nickname 존재 여부로 확인
      alert('로그인이 필요합니다.');
      return;
    }

    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
    
    // 1. Optimistic UI 업데이트
    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);
    localStorage.setItem(`liked-comment-${comment.id}`, String(newIsLiked));

    try {
      // 2. API 호출
      await toggleCommentLike(comment.id);
      // 3. 부모 상태 업데이트 (선택적)
      onCommentUpdate({ ...comment, likeCount: newLikeCount });
    } catch (error) {
      console.error('Error toggling like:', error);
      // 4. 에러 발생 시 롤백
      setIsLiked(!newIsLiked);
      setLikeCount(likeCount);
      localStorage.setItem(`liked-comment-${comment.id}`, String(!newIsLiked));
    }
  }

  const toggleShowChildren = async () => {
    const newShowChildren = !showChildren;
    setShowChildren(newShowChildren);
    if (newShowChildren && childComments.length === 0 && comment.replyCount > 0) {
      const response = await getChildComments(comment.id);
      if (response.success) {
        setChildComments(response.data?.content || []);
      }
    }
  }

  const handleReplySuccess = (newReply: Comment) => {
    setChildComments([...childComments, newReply]);
    setShowReplyForm(false);
    onReplyCreated(); // 부모에게 답글 생성 알림
  };

  return (
    <div className="flex space-x-4">
        <Image
          src={comment.writerProfileImage || '/default-profile.png'}
          alt={comment.writerNickname}
          width={40}
          height={40}
          className="rounded-full"
        />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="font-bold">{comment.writerNickname}</span>
          <span className="text-sm text-gray-500">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        {isEditing ? (
          <div>
            <textarea
              className="w-full p-2 border rounded-md mt-2"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex space-x-2 mt-2">
              <button onClick={handleUpdate} className="px-3 py-1 bg-blue-500 text-white rounded-md">저장</button>
              <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-300 rounded-md">취소</button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mt-1">{comment.content}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <button onClick={handleLike} className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}>
                <span>♥</span>
                <span>{likeCount}</span>
              </button>
              {!isReply && (
                <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-gray-500 hover:text-gray-700">답글 달기</button>
              )}
              {isAuthor && (
                <div className="flex space-x-2">
                  <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-gray-700">수정</button>
                  <button onClick={handleDelete} className="text-gray-500 hover:text-gray-700">삭제</button>
                </div>
              )}
            </div>

            {/* 대댓글(답글) 관련 UI는 루트 댓글에만 표시 */}
            {!isReply && (
              <>
                {showReplyForm && (
                  <div className="mt-4 pl-8">
                    <CommentForm 
                      postId={postId} 
                      parentId={comment.id} 
                      onSuccess={handleReplySuccess} 
                      placeholder={`${comment.writerNickname}님에게 답글 남기기`}
                      buttonText='답글 등록'
                    />
                  </div>
                )}
                {comment.replyCount > 0 && (
                  <button onClick={toggleShowChildren} className="text-sm text-blue-500 mt-2">
                    {showChildren ? '답글 숨기기' : `답글 ${comment.replyCount}개 보기`}
                  </button>
                )}
                {showChildren && (
                  <div className="mt-4 pl-8 border-l-2">
                    {childComments.map(child => (
                      <CommentItem key={child.id} postId={postId} comment={child} onCommentUpdate={onCommentUpdate} onCommentDelete={onCommentDelete} onReplyCreated={onReplyCreated} isReply={true} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}