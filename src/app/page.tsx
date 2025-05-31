'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getBlogs, Blog } from '@/services/blogService';
import { HeroSection } from '@/components/Home/HeroSection';
import { PostList } from '@/components/Post/PostList';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    getBlogs()
      .then(data => setPosts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <p className="text-center py-20">로그인이 필요합니다.</p>;
  }
  if (loading) {
    return <p className="text-center py-20">로딩 중…</p>;
  }
  if (error) {
    return <p className="text-center py-20 text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">인기 블로그</h2>
          <PostList posts={posts} />
        </section>
      </main>
    </div>
  );
}