import type { Metadata } from 'next';
import BlogPageClient from '@/app/blog/[userId]/BlogPageClient';
import { getUserProfile } from '@/apis/userApi';
import { truncate, toAbsoluteUrl } from '@/utils/seo';

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
        images: [toAbsoluteUrl(profile.profileImageUrl || '/logo.jpeg')],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${nickname}의 블로그`,
        description: truncate(`${nickname}님의 게시글 모음`, 200),
        images: [toAbsoluteUrl(profile.profileImageUrl || '/logo.jpeg')],
      },
      alternates: { canonical: `/blog/${userId}` },
    };
  } catch {
    return {
      title: '블로그',
      description: '사용자 블로그',
      openGraph: { images: [toAbsoluteUrl('/logo.jpeg')] },
      twitter: { card: 'summary_large_image', images: [toAbsoluteUrl('/logo.jpeg')] },
      alternates: { canonical: `/blog/${userId}` },
    };
  }
}

export default function BlogPage() {
  return <BlogPageClient />;
}
