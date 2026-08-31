import { api } from '@/lib/api';
import BusinessCard from '@/components/BusinessCard';
import { notFound } from 'next/navigation';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let data;
  
  try {
    data = await api.getCategories().then((categories: any[]) => 
      categories.find((c: any) => c.slug === slug)
    );
    
    if (!data) notFound();
  } catch (error) {
    notFound();
  }

  const businesses = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}/businesses`,
    { next: { revalidate: 60 } }
  ).then(res => res.json());

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-400 to-amber-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{data.icon || '📁'}</span>
            <div>
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900">{data.name}</h1>
              <p className="text-xl text-gray-800 mt-2">
                {businesses.businesses?.total || 0} businesses found
              </p>
            </div>
          </div>
          {data.description && (
            <p className="text-lg text-gray-800 max-w-3xl">{data.description}</p>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="font-semibold text-gray-700">Filter by:</span>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option>All Areas</option>
              <option>Boring Road</option>
              <option>Kankarbagh</option>
              <option>Bailey Road</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option>Sort by: Featured</option>
              <option>Highest Rated</option>
              <option>Most Reviewed</option>
              <option>Newest</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-amber-500 rounded" />
              <span className="text-gray-700">Verified Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-amber-500 rounded" />
              <span className="text-gray-700">Open Now</span>
            </label>
          </div>
        </div>
      </section>

      {/* Businesses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {businesses.businesses?.data && businesses.businesses.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.businesses.data.map((business: any) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </section>
    </main>
  );
}
