import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { EXPLORE_FILTERS } from '@/lib/explore-filters';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Rebuild the sitemap every hour so new posts get picked up fast
export const revalidate = 3600;

// All public static pages (Requirement 10.8: sitemap includes all public pages)
const STATIC_ROUTES: {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  priority: number;
}[] = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.9 },
  { path: '/events', changeFrequency: 'daily', priority: 0.9 },
  { path: '/explore', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/categories', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/areas', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/best-of-patna', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/reviews', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/advertise', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/claim-business', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/add-business', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms-of-use', changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // SEO landing pages for each Explore filter (/explore/trending, …)
  const exploreFilterRoutes: MetadataRoute.Sitemap = EXPLORE_FILTERS.map((filter) => ({
    url: `${SITE_URL}/explore/${filter.key}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

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

  return [...staticRoutes, ...exploreFilterRoutes, ...posts];
}
