'use client';

import { useState, useEffect } from 'react'
import { Comment } from '@/utils/types'
import { useProfileStore } from '@/store/ProfileStore'
import { updateComment, deleteComment, toggleCommentLike, getChildComments } from '@/apis/commentApi'
import CommentForm from './CommentForm'
import UserInitialAvatar from '@/components/Common/UserInitialAvatar'
import { Heart, MessageCircle, Edit2, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
  onCommentDelete: (commentId: number) => void
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
  const replyCount = comment.replyCount ?? 0
  const isDeleted = comment.deleted

  // 실시간 시간 업데이트를 위한 state
  const [relativeTime, setRelativeTime] = useState(() => timeAgo(comment.createdAt))

  // 1분마다 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(timeAgo(comment.createdAt))
    }, 60000) // 60초마다 업데이트

    return () => clearInterval(interval)
  }, [comment.createdAt])
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
        onCommentDelete(comment.id);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleLike = async () => {
    if (isDeleted) {
      return;
    }
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
    if (newShowChildren && childComments.length === 0 && replyCount > 0) {
      const response = await getChildComments(comment.id);
      if (response.success) {
        setChildComments(response.data?.content || []);
      }
    }
  }

  const handleReplySuccess = (newReply: Comment) => {
    setChildComments(prev => [...prev, newReply]);
    setShowReplyForm(false);
    setShowChildren(true);
    const updatedReplyCount = (comment.replyCount ?? 0) + 1;
    onCommentUpdate({ ...comment, replyCount: updatedReplyCount });
    onReplyCreated(); // 부모에게 답글 생성 알림
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex gap-3 md:gap-4 p-4 md:p-6 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors duration-200 border border-gray-200 dark:border-gray-700"
    >
        <UserInitialAvatar
          name={comment.writerNickname}
          imageUrl={comment.writerProfileImage}
          size={40}
        />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-bold">{comment.writerNickname}</span>
          <span className="text-sm text-gray-500">
            {relativeTime}
          </span>
        </div>
        {isEditing ? (
          <div className="mt-2">
            <textarea
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none"
              rows={3}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              aria-label="댓글 수정"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 min-h-[44px]"
              >
                저장
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors duration-200 min-h-[44px]"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <div>
              <p className="mt-1">{comment.content}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <motion.button
                  onClick={handleLike}
                  disabled={isDeleted}
                  whileTap={!isDeleted ? { scale: 0.9 } : {}}
                  whileHover={!isDeleted ? { scale: 1.05 } : {}}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-all duration-200 min-h-[44px] md:min-h-0 ${
                    isDeleted
                      ? 'text-gray-300 cursor-not-allowed'
                      : isLiked
                      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                      : 'text-gray-500 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  aria-label={isLiked ? '좋아요 취소' : '좋아요'}
                  aria-pressed={isLiked}
                >
                  <motion.div
                    animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <Heart
                      size={18}
                      className={`transition-transform ${isLiked ? 'fill-current' : ''}`}
                    />
                  </motion.div>
                  <span className="font-medium">{likeCount}</span>
                </motion.button>
              {!isReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 min-h-[44px] md:min-h-0"
                  aria-label="답글 달기"
                >
                  <MessageCircle size={16} />
                  <span>답글</span>
                </button>
              )}
              {isAuthor && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200 min-h-[44px] md:min-h-0"
                    aria-label="댓글 수정"
                  >
                    <Edit2 size={16} />
                    <span>수정</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 min-h-[44px] md:min-h-0"
                    aria-label="댓글 삭제"
                  >
                    <Trash2 size={16} />
                    <span>삭제</span>
                  </button>
                </div>
              )}
            </div>

            {/* 대댓글(답글) 관련 UI는 루트 댓글에만 표시 */}
            {!isReply && (
              <>
                <AnimatePresence>
                  {showReplyForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pl-4 md:pl-8 overflow-hidden"
                    >
                      <CommentForm
                        postId={postId}
                        parentId={comment.id}
                        onSuccess={handleReplySuccess}
                        placeholder={`${comment.writerNickname}님에게 답글 남기기`}
                        buttonText='답글 등록'
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                {replyCount > 0 && (
                  <motion.button
                    onClick={toggleShowChildren}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1.5 mt-3 px-2 py-1.5 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
                    aria-expanded={showChildren}
                  >
                    <MessageCircle size={14} />
                    {showChildren ? '답글 숨기기' : `답글 ${replyCount}개 보기`}
                  </motion.button>
                )}
                <AnimatePresence>
                  {showChildren && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="mt-4 pl-4 md:pl-8 border-l-2 border-blue-200 dark:border-blue-800 space-y-3 overflow-hidden"
                    >
                      {childComments.map(child => (
                        <CommentItem key={child.id} postId={postId} comment={child} onCommentUpdate={onCommentUpdate} onCommentDelete={onCommentDelete} onReplyCreated={onReplyCreated} isReply={true} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
