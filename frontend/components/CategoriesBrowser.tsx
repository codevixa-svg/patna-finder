'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

const TILE_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-red-100 text-red-700',
  'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
];

const PAGE_SIZE = 48;

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
}

/**
 * Client-side searchable grid for the full GMB category list (4k+ items).
 * Progressive rendering keeps the DOM small; the list itself is SSR'd once.
 */
export default function CategoriesBrowser({
  categories,
}: {
  categories: CategoryItem[];
}) {
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <>
      {/* Search */}
      <div className="relative max-w-xl mx-auto mb-10">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          placeholder={`Search ${categories.length} categories...`}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 bg-white shadow-sm outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-900"
        />
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">
            No categories found for &ldquo;{query}&rdquo;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visible.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center text-center gap-3 hover:border-amber-400 hover:shadow-md transition-all group"
            >
              <div
                className={`w-12 h-12 ${TILE_COLORS[index % TILE_COLORS.length]} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}
              >
                <CategoryIcon icon={category.icon} className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-amber-600 transition">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      )}

      {/* Load more */}
      {filtered.length > visibleCount && (
        <div className="text-center mt-10">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="px-8 py-3 bg-[#153b78] text-white font-semibold rounded-xl hover:bg-[#0f2c5c] transition"
          >
            Load More ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </>
  );
}