'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import BusinessCard from '@/components/BusinessCard';

export default function AreaDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [area, setArea] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAreaBusinesses(1);
  }, [slug]);

  async function fetchAreaBusinesses(p: number) {
    try {
      setLoading(true);
      const data = await api.getAreaBusinesses(slug, { page: p, per_page: 12 });
      setArea(data.area);
      setBusinesses(data.businesses?.data || []);
      setLastPage(data.businesses?.last_page || 1);
      setTotal(data.businesses?.total || 0);
      setPage(p);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/areas" className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            All Areas
          </Link>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">{area?.name || slug}</h1>
          {area?.description && <p className="text-xl text-gray-300">{area.description}</p>}
          {!loading && <p className="text-gray-400 mt-2">{total} businesses found</p>}
        </div>
      </section>

      {/* Businesses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-lg">No businesses found in this area</p>
            <Link href="/areas" className="text-blue-600 hover:underline mt-2 inline-block">Browse other areas</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>

            {lastPage > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                <button
                  onClick={() => fetchAreaBusinesses(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page} of {lastPage}</span>
                <button
                  onClick={() => fetchAreaBusinesses(page + 1)}
                  disabled={page === lastPage}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
