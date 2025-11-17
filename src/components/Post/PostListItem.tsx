'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, ThumbsUp } from 'lucide-react';
import type { Blog } from '@/apis/blogApi';

export function PostListItem({ post }: { post: Blog }) {
  const { id, title, summary, thumbnailUrl, createdAt, viewCount, likeCount } = post;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="w-full"
    >
      <Link href={`/post/${id}`} className="block w-full">
        <div className="group bg-white rounded-lg p-4 flex gap-6 items-center hover:bg-gray-50 hover:shadow-lg transition-all duration-200 border border-gray-200">
          {thumbnailUrl && (
            <div className="relative w-32 h-20 sm:w-40 sm:h-24 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={thumbnailUrl}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
          )}
          <div className="flex flex-col flex-grow">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 truncate">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-1 sm:line-clamp-2">
              {summary}
            </p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{new Date(createdAt).toLocaleDateString()}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{viewCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp size={14} />
                  <span>{likeCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
