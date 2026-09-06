import { api } from '@/lib/api';
import CategoriesBrowser from '@/components/CategoriesBrowser';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
  title: 'All Categories - Patna Finder',
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
  }));

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Browse Categories</h1>
          <p className="text-xl text-gray-300">{categories.length} categories — find exactly what you're looking for</p>
        </div>
      </section>

      {/* Breadcrumb — same UI as the business details page */}
      <Breadcrumbs items={[{ label: 'Categories' }]} />

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <CategoriesBrowser categories={categories} />
      </section>
    </main>
  );
}
