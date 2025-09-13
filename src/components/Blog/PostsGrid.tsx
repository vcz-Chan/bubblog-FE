'use client';

import { Blog } from '@/apis/blogApi';
import { PostList } from '../Post/PostList';


interface Props {
  posts?: Blog[];
  viewMode: 'card' | 'list';
}

export function PostsGrid({ posts = [], viewMode }: Props) {
  if (posts.length === 0) {
    return <p className="text-center text-gray-500">등록된 글이 없습니다.</p>;
  }

  return <PostList posts={posts} viewMode={viewMode} />;
}
