'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AreasPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAreas();
  }, []);

  async function fetchAreas() {
    try {
      const data = await api.getAreas();
      setAreas(Array.isArray(data) ? data : data.data || []);
    } catch {
      setAreas([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Explore Patna By Area</h1>
          <p className="text-xl text-gray-300">Discover businesses in every corner of Patna</p>
        </div>
      </section>

      {/* Areas Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : areas.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-lg">No areas found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {areas.map((area) => (
              <Link
                key={area.id}
                href={`/areas/${area.slug}`}
                className="relative h-48 rounded-2xl overflow-hidden group bg-gradient-to-br from-gray-800 to-gray-900 hover:shadow-xl transition-shadow"
              >
                {area.banner_image ? (
                  <img src={area.banner_image} alt={area.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="relative h-full flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg">{area.name}</h3>
                    {area.description && (
                      <p className="text-white/60 text-xs mt-1 line-clamp-1">{area.description}</p>
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-20 transition" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
