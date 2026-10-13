import { api } from '@/lib/api';
import CategoriesBrowser from '@/components/CategoriesBrowser';

export const metadata = {
  title: 'All Categories - Khojya',
  description: 'Browse all business categories in Patna',
};

export default async function CategoriesPage() {
  // Full GMB category list (4k+). Cached server-side for an hour.
  // Guarded so a build/prerender without a reachable API still succeeds —
  // ISR (revalidate: 3600) picks up the data on the next regeneration.
  let all: any = [];
  try {
    all = await api.getCategories(
      undefined,
      { next: { revalidate: 3600 } } as RequestInit,
    );
  } catch {
    // API down — render the shell with an empty list
  }
  // Trim to the minimal fields the browser component needs — keeps the
  // serialized payload small.
  const categories = (Array.isArray(all) ? all : all?.data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    description: c.description,
    // Real listing count (added by Category::withCount('businesses') on the
    // API) — powers the "N Listings" line on the featured cards.
    businesses_count: c.businesses_count ?? 0,
  }));

  return (
    <main className="min-h-screen bg-white">
      {/* Hero, curated category cards, full searchable list & golden
          skyline stats band — approved categories design (cards rendered
          without photos). */}
      <CategoriesBrowser categories={categories} />
    </main>
  );
}