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
        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="solid"
          className="mt-2"
        >
          {buttonText}
        </Button>
      </div>
    </form>
  );
}
