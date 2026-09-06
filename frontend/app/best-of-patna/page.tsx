'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function BestOfPatnaPage() {
  const categories = [
    { slug: 'coaching', name: 'Coaching Institutes', icon: '📚', color: 'from-purple-500 to-purple-600' },
    { slug: 'hospitals', name: 'Hospitals', icon: '🏥', color: 'from-red-500 to-red-600' },
    { slug: 'restaurants', name: 'Restaurants', icon: '🍽️', color: 'from-orange-500 to-orange-600' },
    { slug: 'cafes', name: 'Cafes', icon: '☕', color: 'from-amber-500 to-amber-600' },
    { slug: 'dentists', name: 'Dental Clinics', icon: '🦷', color: 'from-teal-500 to-teal-600' },
    { slug: 'doctors', name: 'Doctors', icon: '👨‍⚕️', color: 'from-blue-500 to-blue-600' },
    { slug: 'gyms', name: 'Gyms & Fitness', icon: '💪', color: 'from-green-500 to-green-600' },
    { slug: 'hotels', name: 'Hotels', icon: '🏨', color: 'from-indigo-500 to-indigo-600' },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
            Annual Awards 2025
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Best Of Patna</h1>
          <p className="text-xl text-gray-300">Celebrating excellence in every category</p>
        </div>
      </section>

      {/* Breadcrumb — same UI as the business details page */}
      <Breadcrumbs items={[{ label: 'Best Of Patna' }]} />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/best-of-patna/${cat.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition`}>
                {cat.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg group-hover:text-amber-500 transition">Best {cat.name}</h3>
              <p className="text-sm text-gray-500 mt-1">View winners & nominees</p>
              <div className="flex items-center gap-1 mt-4 text-amber-500 text-sm font-semibold">
                View Winners
                <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">How Awards Are Determined</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Community Votes', desc: 'Based on customer reviews and ratings from real people' },
              { step: '2', title: 'Quality Analysis', desc: 'We analyze business quality, consistency, and customer satisfaction' },
              { step: '3', title: 'Annual Selection', desc: 'Top businesses are awarded in their respective categories each year' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-amber-400 text-gray-900 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">{item.step}</div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
