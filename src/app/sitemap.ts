import type { MetadataRoute } from 'next';
import { getBlogsPage } from '@/apis/blogApi';
import { SORT_OPTIONS } from '@/utils/constants';
import { getSiteUrl } from '@/utils/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
  ];

  try {
    const page = await getBlogsPage(0, 20, SORT_OPTIONS.LATEST);
    for (const post of page.content) {
      routes.push({ url: `${base}/post/${post.id}`, lastModified: new Date(post.createdAt) });
    }
  } catch {
    // ignore fetch errors; return base routes
  }

  return routes;
}

