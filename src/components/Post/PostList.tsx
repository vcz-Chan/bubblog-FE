'use client';

import { Blog } from '@/services/blogService';
import { PostCard } from './PostCard';

interface PostListProps {
  posts: Blog[];
}

export function PostList({ posts }: PostListProps) {
  console.log(posts)
  if (posts.length === 0) {
    return <p className="text-center py-10 text-gray-500">등록된 게시물이 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}