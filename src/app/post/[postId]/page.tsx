import 'server-only';
import type { Metadata } from 'next';
import PostDetailClient from "@/app/post/[postId]/PostDetailClient";
import PostDetailBodyServer from "@/app/post/[postId]/PostDetailBodyServer";
import { getBlogById } from '@/apis/blogApi';
import { truncate, toAbsoluteUrl } from '@/utils/seo';
import PostStructuredData from '@/app/post/[postId]/PostStructuredData';
import CommentList from '@/components/Comment/CommentList';

export async function generateMetadata(
  { params }: { params: Promise<{ postId: string }> }
): Promise<Metadata> {
  const { postId } = await params;
  try {
    const post = await getBlogById(Number(postId));
    return {
      title: truncate(post.title, 60),
      description: truncate(post.summary, 160),
      openGraph: {
        title: truncate(post.title, 60),
        description: truncate(post.summary, 200),
        images: [toAbsoluteUrl(post.thumbnailUrl || '/logo.png')],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: truncate(post.title, 60),
        description: truncate(post.summary, 200),
        images: [toAbsoluteUrl(post.thumbnailUrl || '/logo.png')],
      },
      alternates: { canonical: `/post/${postId}` },
    };
  } catch {
    return {
      title: '게시글',
      description: '게시글 상세',
      openGraph: { images: [toAbsoluteUrl('/logo.png')] },
      twitter: { card: 'summary_large_image', images: [toAbsoluteUrl('/logo.png')] },
      alternates: { canonical: `/post/${postId}` },
    };
  }
}

export default async function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  return (
    <article className="w-full p-8 lg:px-40 bg-white">
      {/* CSR 부분 */}
      <PostDetailClient postId={postId} />

      {/* SSR 본문 */}
      <PostDetailBodyServer postId={postId} />

      {/* CSR 댓글 */}
      <CommentList postId={postId} />

      {/* JSON-LD (Article) */}
      <PostStructuredData postId={postId} />
    </article>
  );
}
