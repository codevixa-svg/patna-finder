'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import BusinessCard from '@/components/BusinessCard';

const CATEGORY_META: Record<string, { icon: string; label: string }> = {
  coaching: { icon: '📚', label: 'Coaching Institutes' },
  hospitals: { icon: '🏥', label: 'Hospitals' },
  restaurants: { icon: '🍽️', label: 'Restaurants' },
  cafes: { icon: '☕', label: 'Cafes' },
  dentists: { icon: '🦷', label: 'Dental Clinics' },
  doctors: { icon: '👨‍⚕️', label: 'Doctors' },
  gyms: { icon: '💪', label: 'Gyms & Fitness' },
  hotels: { icon: '🏨', label: 'Hotels' },
};

export default function BestOfCategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const meta = CATEGORY_META[categorySlug] || { icon: '🏆', label: categorySlug.replace(/-/g, ' ') };

  useEffect(() => {
    fetchBusinesses();
  }, [categorySlug]);

  async function fetchBusinesses() {
    try {
      setLoading(true);
      const categories = await api.getCategories();
      const catList = Array.isArray(categories) ? categories : categories.data || [];
      const cat = catList.find((c: any) => c.slug === categorySlug || c.name?.toLowerCase().includes(categorySlug));

      if (cat) {
        const data = await api.getBusinesses({ category_id: cat.id, sort_by: 'rating', per_page: 20 });
        setBusinesses(Array.isArray(data) ? data : data.data || []);
      } else {
        const data = await api.getBusinesses({ sort_by: 'rating', per_page: 20 });
        setBusinesses(Array.isArray(data) ? data : data.data || []);
      }
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
          <Link href="/best-of-patna" className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            All Categories
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{meta.icon}</span>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold">Best {meta.label}</h1>
              <p className="text-gray-300 mt-2">Top rated {meta.label.toLowerCase()} in Patna</p>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <span className="text-6xl mb-4 block">{meta.icon}</span>
            <p className="text-lg">No {meta.label.toLowerCase()} found yet</p>
            <p className="text-sm mt-2">Check back soon for award winners!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((b, idx) => (
              <div key={b.id} className="relative">
                {idx < 3 && (
                  <div className="absolute -top-3 -left-3 z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg" style={{
                    background: idx === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : idx === 1 ? 'linear-gradient(135deg, #94a3b8, #64748b)' : 'linear-gradient(135deg, #c2884e, #a16838)',
                    color: '#fff',
                  }}>
                    #{idx + 1}
                  </div>
                )}
                <BusinessCard business={b} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
