import { getBlogById } from '@/apis/blogApi';
import { getSiteUrl, toAbsoluteUrl } from '@/utils/seo';

export default async function PostStructuredData({ postId }: { postId: string }) {
  try {
    const post = await getBlogById(Number(postId));
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.summary,
      image: [toAbsoluteUrl(post.thumbnailUrl || '/logo.png')],
      mainEntityOfPage: `${getSiteUrl()}/post/${post.id}`,
      author: {
        '@type': 'Person',
        name: post.nickname,
      },
      datePublished: post.createdAt,
    };
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    );
  } catch {
    return null;
  }
}

