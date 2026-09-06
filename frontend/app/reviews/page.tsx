'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function ReviewsPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopRated();
  }, []);

  async function fetchTopRated() {
    try {
      const data = await api.getBusinesses({ sort_by: 'rating', per_page: 20 });
      const list = Array.isArray(data) ? data : data.data || [];
      setBusinesses(list.filter((b: any) => Number(b.rating) > 0));
    } catch {
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">What Patna Says</h1>
          <p className="text-xl text-gray-300">Real reviews from real people across Patna</p>
        </div>
      </section>

      {/* Breadcrumb — same UI as the business details page */}
      <Breadcrumbs items={[{ label: 'Reviews' }]} />

      {/* Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {businesses.map((b) => (
              <Link
                key={b.id}
                href={`/business/${b.slug}`}
                className="block bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition group"
              >
                <div className="flex items-start gap-4">
                  {/* Business Icon */}
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {b.logo ? (
                      <img src={b.logo} alt={b.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">🏢</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-amber-500 transition">{b.name}</h3>
                      {b.is_verified && (
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {b.category?.name || 'Business'} • {b.area?.name || 'Patna'}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex text-amber-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.round(Number(b.rating)) ? '' : 'text-gray-300'}>★</span>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{Number(b.rating).toFixed(1)}</span>
                      <span className="text-sm text-gray-400">({b.review_count || 0} reviews)</span>
                    </div>
                    {b.short_description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{b.short_description}</p>
                    )}
                  </div>

                  <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-500 transition flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
