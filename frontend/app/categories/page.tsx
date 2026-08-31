import { api } from '@/lib/api';
import Link from 'next/link';

export const metadata = {
  title: 'All Categories - Patna Finder',
  description: 'Browse all business categories in Patna',
};

export default async function CategoriesPage() {
  const categories = await api.getCategories();

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Browse Categories</h1>
          <p className="text-xl text-gray-300">Find exactly what you're looking for</p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="card text-center group hover:scale-105 transition-all"
            >
              <div className="text-5xl mb-4">{category.icon || '📁'}</div>
              <h3 className="font-bold text-gray-900 group-hover:text-amber-500 transition">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{category.description}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
