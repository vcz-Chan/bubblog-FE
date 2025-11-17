'use client';

import { MessageCircle } from 'lucide-react';

export default function CommentEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <MessageCircle size={32} className="text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        아직 댓글이 없습니다
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
        이 글에 첫 댓글을 남겨보세요!
      </p>
    </div>
  );
}
