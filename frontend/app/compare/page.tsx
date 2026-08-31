'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ComparePage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selected, setSelected] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCategory) fetchCategoryBusinesses();
  }, [selectedCategory]);

  async function fetchData() {
    try {
      const [bizData, catData] = await Promise.all([
        api.getBusinesses({ per_page: 50 }),
        api.getCategories(),
      ]);
      const list = Array.isArray(bizData) ? bizData : bizData.data || [];
      setBusinesses(list);
      setCategories(Array.isArray(catData) ? catData : catData.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategoryBusinesses() {
    try {
      const data = await api.getBusinesses({ category_id: selectedCategory, per_page: 50 });
      const list = Array.isArray(data) ? data : data.data || [];
      setBusinesses(list);
      setSelected([]);
    } catch {
      // ignore
    }
  }

  function toggleSelect(business: any) {
    if (selected.find((s) => s.id === business.id)) {
      setSelected(selected.filter((s) => s.id !== business.id));
    } else if (selected.length < 3) {
      setSelected([...selected, business]);
    }
  }

  const ratingLabel = (r: number) => {
    if (r >= 4.5) return { text: 'Excellent', color: 'text-green-600 bg-green-50' };
    if (r >= 4) return { text: 'Very Good', color: 'text-blue-600 bg-blue-50' };
    if (r >= 3) return { text: 'Good', color: 'text-yellow-600 bg-yellow-50' };
    return { text: 'Average', color: 'text-gray-600 bg-gray-50' };
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Compare Businesses</h1>
          <p className="text-xl text-gray-300">Select up to 3 businesses to compare side by side</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Filter by Category</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedCategory(''); fetchData(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!selectedCategory ? 'bg-amber-400 text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === String(cat.id) ? 'bg-amber-400 text-gray-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Comparison */}
        {selected.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Comparing {selected.length} {selected.length === 1 ? 'business' : 'businesses'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selected.map((b, idx) => (
                <div key={b.id} className="text-center relative">
                  <button onClick={() => toggleSelect(b)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 z-10">✕</button>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                    {b.logo ? <img src={b.logo} alt={b.name} className="w-full h-full object-cover" /> : <span className="text-4xl">🏢</span>}
                  </div>
                  <h3 className="font-bold text-gray-900">{b.name}</h3>
                  <p className="text-sm text-gray-500">{b.category?.name || 'Business'}</p>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm text-gray-500 pb-3 w-1/4">Feature</th>
                    {selected.map((b) => (
                      <th key={b.id} className="text-center text-sm font-semibold text-gray-900 pb-3">{b.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-50">
                    <td className="py-3 text-sm text-gray-500">Rating</td>
                    {selected.map((b) => {
                      const rl = ratingLabel(Number(b.rating));
                      return (
                        <td key={b.id} className="py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${rl.color}`}>
                            {Number(b.rating).toFixed(1)} ★ ({rl.text})
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="py-3 text-sm text-gray-500">Reviews</td>
                    {selected.map((b) => (
                      <td key={b.id} className="py-3 text-center text-sm font-medium text-gray-900">{b.review_count || 0}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="py-3 text-sm text-gray-500">Area</td>
                    {selected.map((b) => (
                      <td key={b.id} className="py-3 text-center text-sm text-gray-700">{b.area?.name || '-'}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="py-3 text-sm text-gray-500">Verified</td>
                    {selected.map((b) => (
                      <td key={b.id} className="py-3 text-center">
                        {b.is_verified ? <span className="text-green-600 text-sm font-medium">✓ Yes</span> : <span className="text-gray-400 text-sm">No</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="py-3 text-sm text-gray-500">Featured</td>
                    {selected.map((b) => (
                      <td key={b.id} className="py-3 text-center">
                        {b.is_featured ? <span className="text-amber-600 text-sm font-medium">★ Yes</span> : <span className="text-gray-400 text-sm">No</span>}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="py-3 text-sm text-gray-500">Phone</td>
                    {selected.map((b) => (
                      <td key={b.id} className="py-3 text-center text-sm text-gray-700">{b.phone || '-'}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
              <div className="mt-4 flex justify-center">
                {selected.map((b) => (
                  <Link key={b.id} href={`/business/${b.slug}`} className="mx-2 text-sm text-blue-600 hover:underline font-medium">
                    View {b.name} →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Business List */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">Select Businesses to Compare {selected.length > 0 && `(selected ${selected.length}/3)`}</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((b) => {
              const isSelected = !!selected.find((s) => s.id === b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => toggleSelect(b)}
                  disabled={!isSelected && selected.length >= 3}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50'
                      : selected.length >= 3
                        ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {b.logo ? <img src={b.logo} alt={b.name} className="w-full h-full object-cover" /> : <span className="text-xl">🏢</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{b.name}</p>
                    <p className="text-xs text-gray-500">{b.category?.name || 'Business'} • {Number(b.rating).toFixed(1)} ★</p>
                  </div>
                  {isSelected && (
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
