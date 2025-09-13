import type { Metadata } from 'next';
import HomeClient from '@/app/HomeClient';
import { getBlogsPage } from '@/apis/blogApi';
import { SORT_OPTIONS } from '@/utils/constants';
import { truncate, toAbsoluteUrl } from '@/utils/seo';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getBlogsPage(0, 8, SORT_OPTIONS.LATEST);
    const titles = page.content.slice(0, 3).map(p => truncate(p.title, 50));
    const descRaw = titles.length > 0 ? `글이 대화가 되는 블로그 | 최신 글: ${titles.join(', ')}` : '글이 대화가 되는 블로그';
    const description = truncate(descRaw, 160);
    const firstImage = toAbsoluteUrl(page.content.find(p => !!p.thumbnailUrl)?.thumbnailUrl || '/logo.jpeg');

    return {
      title: 'Bubblog',
      description,
      openGraph: {
        title: 'Bubblog',
        description,
        images: [firstImage],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Bubblog',
        description,
        images: [firstImage],
      },
      alternates: { canonical: '/' },
    };
  } catch {
    return {
      title: 'Bubblog',
      description: '글이 대화가 되는 블로그',
      openGraph: { title: 'Bubblog', description: '글이 대화가 되는 블로그', images: [toAbsoluteUrl('/logo.jpeg')], type: 'website' },
      twitter: { card: 'summary_large_image', title: 'Bubblog', description: '글이 대화가 되는 블로그', images: [toAbsoluteUrl('/logo.jpeg')] },
      alternates: { canonical: '/' },
    };
  }
}

export default function Home() {
  return <HomeClient />;
}
