'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Blog } from '@/services/blogService';

interface PostCardProps {
  post: Blog;
  children?: React.ReactNode;
}

export function PostCard({ post, children }: PostCardProps) {
  const { id, title, summary, thumbnailUrl } = post;

 return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between">
      <Link href={`/post/${id}`} className="block mb-4">
        <div className="h-40 w-full relative mb-4">
          <Image
            src={thumbnailUrl || '/logo.jpeg'}
            alt={title}
            fill
            className="object-cover rounded"
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">
          {title}
        </h3>
        <p
          className="text-gray-700 overflow-hidden line-clamp-1"
        >
          {summary}
        </p>
      </Link>

      {children && (
        <div className="mt-4 flex justify-end gap-3 text-sm">
          {children}
        </div>
      )}
    </div>
  );
}