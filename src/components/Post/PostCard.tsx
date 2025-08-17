'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, SpringOptions } from 'framer-motion';
import { EyeIcon, HandThumbUpIcon } from '@heroicons/react/24/outline'
import type { Blog } from '@/apis/blogApi';

const springOptions: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2,
};

export function PostCard({ post, children }: { post: Blog; children?: React.ReactNode }) {
  const { id, title, summary, thumbnailUrl, createdAt, viewCount, likeCount } = post;

  // motion 값
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, springOptions);
  const rotateY = useSpring(rawRotateY, springOptions);
  const scale = useSpring(1, springOptions);

  // 마우스 위치에 따라 회전량 계산
  function handleMouse(e: React.MouseEvent) {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    const amp = 20; // 회전 세기 조절

    rawRotateY.set((offsetX / (rect.width / 2)) * amp * -1);
    rawRotateX.set((offsetY / (rect.height / 2)) * amp);
  }

  function handleMouseEnter() {
    scale.set(1.1);
  }

  function handleMouseLeave() {
    rawRotateX.set(0);
    rawRotateY.set(0);
    scale.set(1);
  }

  return (
    <motion.div
      className="relative w-full cursor-pointer"
      style={{
        perspective: 800,
        rotateX,
        rotateY,
        scale,
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-white rounded-2xl shadow hover:shadow-lg transition-colors duration-200 flex flex-col justify-between">
        <Link href={`/post/${id}`} className="block">
          <div className="relative h-70 sm:h-60 lg:h-60 w-full rounded-t-2xl overflow-hidden">
            <Image
              src={thumbnailUrl || '/logo.jpeg'}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex items-center space-x-4 bg-black/40 text-white text-xs px-3 py-1 rounded-lg">
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-4 w-4" />
              <span>{viewCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <HandThumbUpIcon className="h-4 w-4" />
              <span>{likeCount}</span>
            </div>
          </div>
          <div className="p-3 px-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">
              {title}
            </h3>
            <p className="text-gray-700 overflow-hidden mb-1 line-clamp-1">
              {summary}
            </p>
            <div className="text-sm text-gray-500">
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>

        {children && (
          <div className="flex justify-end gap-3 text-sm px-6 pb-2">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
}