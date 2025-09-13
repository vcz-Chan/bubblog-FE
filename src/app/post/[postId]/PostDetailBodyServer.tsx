// src/app/post/[postId]/PostDetailBodyServer.tsx
import 'server-only';
import { PostDetailBody } from '@/components/PostDetail/Body';
import { getBlogById } from '@/apis/blogApi';
import { notFound } from 'next/navigation';

type BlogDetail = { content: string };

/**
 * 서버에서만 렌더. postId로 본문(content)만 가져와 SSR로 출력.
 * - 인증 쿠키가 필요하면 cookies()/headers()를 함께 전달
 * - 캐시 없음 (최신 본문)
 */
export default async function PostDetailBodyServer({ postId }: { postId: string }) {
  try {
    const post = await getBlogById(Number(postId));
    if (!post) return notFound();
    return <PostDetailBody content={post.content} />;
  } catch {
    return notFound();
  }
}
