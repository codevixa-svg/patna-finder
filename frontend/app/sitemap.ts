import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Rebuild the sitemap every hour so new posts get picked up fast
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/events`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/explore`, changeFrequency: 'weekly', priority: 0.7 },
  ];

  const posts: MetadataRoute.Sitemap = [];
  try {
    const res = await api.getBlogPosts({ per_page: 100 });
    const items = Array.isArray(res) ? res : res.data || [];
    for (const p of items) {
      posts.push({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: p.updated_at
          ? new Date(p.updated_at)
          : p.published_at
            ? new Date(p.published_at)
            : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch {
    // API down — static routes still get served
  }

  return [...staticRoutes, ...posts];
}
