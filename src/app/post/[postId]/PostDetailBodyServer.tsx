// src/app/post/[postId]/PostDetailBodyServer.tsx
import 'server-only';
import { PostDetailBody } from '@/components/PostDetail/Body';
import { getBlogById } from '@/apis/blogApi';

type BlogDetail = { content: string };

/**
 * 서버에서만 렌더. postId로 본문(content)만 가져와 SSR로 출력.
 * - 인증 쿠키가 필요하면 cookies()/headers()를 함께 전달
 * - 캐시 없음 (최신 본문)
 */
export default async function PostDetailBodyServer({ postId }: { postId: string }) {
  const post = await getBlogById(Number(postId));

  if (!post) {
    return <div className="py-16 text-center text-red-500">본문을 불러오지 못했습니다.</div>;
  }

  return <PostDetailBody content={post.content} />;
}