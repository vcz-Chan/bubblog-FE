import type { Metadata } from 'next';
import BlogPageClient from '@/app/blog/[userId]/BlogPageClient';
import { getUserProfile } from '@/apis/userApi';
import { truncate, toAbsoluteUrl } from '@/utils/seo';
import { notFound } from 'next/navigation';

export async function generateMetadata(
  { params }: { params: Promise<{ userId: string }> }
): Promise<Metadata> {
  const { userId } = await params;
  try {
    const profile = await getUserProfile(userId);
    const nickname = truncate(profile.nickname || userId, 60);
    return {
      title: `${nickname}의 블로그`,
      description: truncate(`${nickname}님의 게시글 모음`, 160),
      openGraph: {
        title: `${nickname}의 블로그`,
        description: truncate(`${nickname}님의 게시글 모음`, 200),
        images: [toAbsoluteUrl(profile.profileImageUrl || '/logo.png')],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${nickname}의 블로그`,
        description: truncate(`${nickname}님의 게시글 모음`, 200),
        images: [toAbsoluteUrl(profile.profileImageUrl || '/logo.png')],
      },
      alternates: { canonical: `/blog/${userId}` },
    };
  } catch {
    return {
      title: '블로그',
      description: '사용자 블로그',
      openGraph: { images: [toAbsoluteUrl('/logo.png')] },
      twitter: { card: 'summary_large_image', images: [toAbsoluteUrl('/logo.png')] },
      alternates: { canonical: `/blog/${userId}` },
    };
  }
}

export default async function BlogPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  try {
    await getUserProfile(userId);
  } catch {
    return notFound();
  }
  return <BlogPageClient />;
}
