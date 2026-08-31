'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import BusinessCard from '@/components/BusinessCard';
import Link from 'next/link';

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState('trending');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses(activeFilter);
  }, [activeFilter]);

  const fetchBusinesses = async (filter: string) => {
    setLoading(true);
    try {
      let data: any;
      switch (filter) {
        case 'trending':
          data = await api.getTrendingBusinesses();
          break;
        case 'featured':
          data = await api.getFeaturedBusinesses();
          break;
        case 'hidden-gems':
          data = await api.getHiddenGems();
          break;
        case 'highest-rated':
          data = await api.getBusinesses({ sort_by: 'rating', per_page: 12 });
          data = data.data || data;
          break;
        case 'recently-added':
          data = await api.getBusinesses({ sort_by: 'created_at', per_page: 12 });
          data = data.data || data;
          break;
        default:
          data = await api.getTrendingBusinesses();
      }
      setBusinesses(Array.isArray(data) ? data : data.data || []);
    } catch {
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { key: 'trending', label: 'Trending' },
    { key: 'highest-rated', label: 'Highest Rated' },
    { key: 'recently-added', label: 'Recently Added' },
    { key: 'hidden-gems', label: 'Hidden Gems' },
    { key: 'featured', label: "Editor's Picks" },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Explore Patna</h1>
          <p className="text-xl text-gray-300">Discover the best businesses, trending places, and hidden gems</p>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  activeFilter === filter.key
                    ? 'bg-amber-400 text-gray-900'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {businesses.map((business: any) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600">Check back later for more listings</p>
          </div>
        )}
      </section>

      {/* Explore by Area */}
      <section className="bg-gradient-to-r from-amber-400 to-amber-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Explore by Area</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {['Boring Road', 'Kankarbagh', 'Bailey Road', 'Patliputra', 'Rajendra Nagar', 'Danapur', 'Patna City'].map((area) => (
              <Link
                key={area}
                href={`/areas/${area.toLowerCase().replace(/\s+/g, '-')}`}
                className="bg-white/90 backdrop-blur-sm hover:bg-white p-6 rounded-2xl text-center font-bold text-gray-900 hover:shadow-xl transition"
              >
                {area}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
