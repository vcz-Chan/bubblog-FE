'use client';

import { useState } from 'react';
import { createComment } from '@/apis/commentApi';
import { Comment } from '@/utils/types';
import { Button } from '@/components/Common/Button';

interface CommentFormProps {
  postId: string;
  parentId?: number | null;
  onSuccess: (newComment: Comment) => void;
  placeholder?: string;
  buttonText?: string;
}

export default function CommentForm({
  postId,
  parentId = null,
  onSuccess,
  placeholder = '댓글을 입력하세요...',
  buttonText = '등록',
}: CommentFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const response = await createComment({ postId, content, parentId });
      if (response.success && response.data) {
        onSuccess(response.data);
        setContent('');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="my-6">
      <textarea
        className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        aria-label="댓글 입력"
      />
      <div className="flex justify-end mt-3">
        <Button
          type="submit"
          variant="solid"
          className="px-6 py-2.5 min-h-[44px]"
          disabled={!content.trim()}
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
}
