import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, ThumbsUp } from 'lucide-react';
import type { Blog } from '@/apis/blogApi';

export function PostCard({ post }: { post: Blog }) {
  const { id, title, summary, thumbnailUrl, createdAt, viewCount, likeCount } = post;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="w-full h-full"
    >
      <Link href={`/post/${id}`} className="block w-full h-full">
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full overflow-hidden border border-gray-200">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={thumbnailUrl || '/logo.png'}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
              {summary}
            </p>
            <div className="mt-auto flex justify-between items-center text-xs text-gray-500">
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