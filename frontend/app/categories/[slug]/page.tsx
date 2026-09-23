import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import CategoryBrowser from '@/components/CategoryBrowser';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data: any = await api.getCategory(slug);
    const name = data?.name || 'Category';
    return {
      title: `Top ${name} in Patna - Patna Finder`,
      description:
        data?.meta_description ||
        data?.description ||
        `Find the best ${name.toLowerCase()} in Patna — verified listings, ratings and reviews on Patna Finder.`,
      alternates: { canonical: `/categories/${slug}` },
    };
  } catch {
    return { title: 'Category - Patna Finder' };
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let category: any;
  try {
    category = await api.getCategory(slug);
    if (!category) notFound();
  } catch {
    notFound();
  }

  // The URL slug may be a plural/singular variant (e.g. /categories/doctors
  // → DB slug "doctor"); use the resolved category's real slug everywhere.
  const resolvedSlug: string = category?.slug || slug;

  // First page of businesses + page extras (stats, area counts, top categories).
  // Guarded so the shell still renders when the API is unreachable.
  let heroStats = { total: 0, avgRating: 0, reviewCount: 0 };
  let areaCounts: any[] = [];
  let topCategories: any[] = [];
  try {
    const res: any = await api.getCategoryBusinesses(resolvedSlug, {
      page: 1,
      per_page: 12,
      sort: 'recommended',
    });
    heroStats = {
      total: res?.stats?.total ?? res?.businesses?.total ?? 0,
      avgRating: Number(res?.stats?.avg_rating ?? 0),
      reviewCount: Number(res?.stats?.review_count ?? 0),
    };
    areaCounts = Array.isArray(res?.area_counts) ? res.area_counts : [];
    topCategories = Array.isArray(res?.top_categories) ? res.top_categories : [];
  } catch {
    // API down — hero shows zeros and the browser retries client-side.
  }

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <CategoryBrowser
        slug={resolvedSlug}
        categoryName={category.name}
        categoryIcon={category.icon}
        heroStats={heroStats}
        areaCounts={areaCounts}
        topCategories={topCategories}
      />
    </main>
  );
}

