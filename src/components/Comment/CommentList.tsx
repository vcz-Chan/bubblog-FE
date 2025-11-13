'use client';

import { useState, useEffect } from 'react'
import { getComments, getCommentsCount } from '@/apis/commentApi'
import { Comment } from '@/utils/types'
import { useAuthStore, selectIsLogin } from '@/store/AuthStore'
import CommentItem from './CommentItem'
import CommentForm from './CommentForm'

interface CommentListProps {
  postId: string
}

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [count, setCount] = useState(0);
  const isLogin = useAuthStore(selectIsLogin)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [commentsResponse, countResponse] = await Promise.all([
          getComments(postId),
          getCommentsCount(postId)
        ]);

        if (commentsResponse.success) {
          setComments(commentsResponse.data || [])
        }
        if (countResponse.success) {
          setCount(countResponse.data || 0);
        }
      } catch (error) {
        console.error('Error fetching comments data:', error)
      }
    }
    fetchInitialData()
  }, [postId])

  const handleNewComment = (newComment: Comment) => {
    setComments([...comments, newComment]);
    setCount(c => c + 1);
  }

  const onCommentUpdate = (updatedComment: Comment) => {
    setComments(
      comments.map(c => (c.id === updatedComment.id ? updatedComment : c)),
    )
  }

  const onCommentDelete = (commentId: number, replyCount: number) => {
    const removeComment = (list: Comment[], id: number): Comment[] => {
      return list.filter(comment => {
        if (comment.children) {
          comment.children = removeComment(comment.children, id);
        }
        return comment.id !== id;
      });
    };
    setComments(prevComments => removeComment(prevComments, commentId));
    setCount(c => c - (1 + replyCount));
  }

  const onReplyCreated = () => {
    setCount(c => c + 1);
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">댓글 {count}개</h3>
      {isLogin ? (
        <CommentForm postId={postId} onSuccess={handleNewComment} />
      ) : (
        <p className="mb-6">댓글을 작성하려면 로그인이 필요합니다.</p>
      )}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="border-b border-gray-200 py-4">
            <CommentItem
              postId={postId}
              comment={comment}
              onCommentUpdate={onCommentUpdate}
              onCommentDelete={onCommentDelete}
              onReplyCreated={onReplyCreated}
            />
          </div>
        ))}
      </div>
    </div>
  )
}