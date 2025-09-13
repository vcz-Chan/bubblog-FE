'use client';

import { Blog } from '@/apis/blogApi';
import { PostCard } from './PostCard';
import { PostListItem } from './PostListItem';

type ViewMode = 'card' | 'list';

interface PostListProps {
  posts: Blog[];
  viewMode: ViewMode;
}

export function PostList({ posts, viewMode }: PostListProps) {
  if (posts.length === 0) {
    return <p className="text-center py-10 text-gray-500">등록된 게시물이 없습니다.</p>;
  }

  return (
    <div className='w-full'>
      {viewMode === 'card' ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
