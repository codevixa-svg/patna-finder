'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { api, API_BASE_URL } from '@/lib/api';
import TrendingBusinessCard from '@/components/TrendingBusinessCard';
import CategoryIcon from '@/components/CategoryIcon';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


export default function Home() {
  const [trendingBusinesses, setTrendingBusinesses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [latestReviews, setLatestReviews] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [govtEvents, setGovtEvents] = useState<any[]>([]);

  useEffect(() => {
    api.getTrendingBusinesses()
      .then(data => setTrendingBusinesses(Array.isArray(data) ? data : data.data || []))
      .catch(() => {});
    api.getCategories({ limit: 12 })
      .then(data => setCategories(Array.isArray(data) ? data : data.data || []))
      .catch(() => {});
    api.getAreas()
      .then(data => setAreas(Array.isArray(data) ? data : data.data || []))
      .catch(() => {});
    api.getPopularSearches()
      .then(data => setPopularSearches(Array.isArray(data) ? data : []))
      .catch(() => {});
    api.getLatestReviews()
      .then(data => setLatestReviews(Array.isArray(data) ? data : data.data || []))
      .catch(() => {});
    api.getLatestBlogPosts()
      .then(data => setBlogPosts(Array.isArray(data) ? data : data.data || []))
      .catch(() => {});
    api.getLatestEvents()
      .then(data => setGovtEvents(Array.isArray(data) ? data : data.data || []))
      .catch(() => {});
  }, []);

  // Color palette for dynamic category tiles
  const categoryColors = [
    'bg-blue-100', 'bg-green-100', 'bg-orange-100', 'bg-red-100', 'bg-yellow-100',
    'bg-purple-100', 'bg-indigo-100', 'bg-teal-100', 'bg-pink-100', 'bg-cyan-100',
  ];

  // Styles per government event type
  const eventTypeStyles: Record<string, { color: string; iconColor: string; icon: string }> = {
    'kavi-samelan': { color: 'bg-purple-100', iconColor: 'text-purple-600', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    'job-mela': { color: 'bg-blue-100', iconColor: 'text-blue-600', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    'industrial': { color: 'bg-orange-100', iconColor: 'text-orange-600', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    'doctors-camp': { color: 'bg-red-100', iconColor: 'text-red-600', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    'it-sector': { color: 'bg-green-100', iconColor: 'text-green-600', icon: 'M2.5 7a2.5 2.5 0 012.5-2.5h10A2.5 2.5 0 0117.5 7v7a2.5 2.5 0 01-2.5 2.5H7.5A2.5 2.5 0 015 14V7zM8 19h8' },
    'other': { color: 'bg-gray-100', iconColor: 'text-gray-600', icon: 'M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z' },
  };

  const formatEventDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Events Swiper slider state
  const swiperRef = useRef<any>(null);

  const scrollEventsBy = (dir: number) => {
    if (dir > 0) swiperRef.current?.slideNext();
    else swiperRef.current?.slidePrev();
  };

  // Fallback content so the page never looks broken while the database is empty
  const fallbackAreas = [
    { id: 'f1', name: 'Boring Road', slug: 'boring-road' },
    { id: 'f2', name: 'Kankarbagh', slug: 'kankarbagh' },
    { id: 'f3', name: 'Bailey Road', slug: 'bailey-road' },
    { id: 'f4', name: 'Patliputra', slug: 'patliputra' },
    { id: 'f5', name: 'Rajendra Nagar', slug: 'rajendra-nagar' },
    { id: 'f6', name: 'Danapur', slug: 'danapur' },
    { id: 'f7', name: 'Kurji', slug: 'kurji' },
  ];

  const fallbackSearches = [
    'Best Judiciary Coaching', 'Top IAS Coaching', 'Best Orthopaedic Doctor', 'Best Wedding Halls',
    'Best Restaurants in Patna', 'Affordable Gyms', 'Top Hospitals Near Me', 'Best Dentist in Boring Road',
    'Coaching for UPSC', 'Best Cafes in Patna', 'Top Lawyers in Patna', 'Best Schools Near Me',
  ];

  const fallbackEvents = [
    { id: 'fe1', title: 'Kavi Samelan', description: 'National poetry gathering featuring celebrated kavis, ghazals & cultural performances.', event_type: 'kavi-samelan', venue: 'Kalidas Rangalaya, Patna', event_date: '2026-08-25' },
    { id: 'fe2', title: 'Job Interview & Rojgar Mela', description: 'Govt job interviews, walk-in drives & recruitment fair for unemployed youth.', event_type: 'job-mela', venue: 'Gandhi Maidan Hall, Patna', event_date: '2026-08-30' },
    { id: 'fe3', title: 'Industrial Function', description: 'Industrial development meet, investment summit & MSME business showcase.', event_type: 'industrial', venue: 'Bihar Industries Association, Patna', event_date: '2026-09-06' },
    { id: 'fe4', title: 'Doctors Camp', description: 'Free health checkup & specialist consultation medical camp for all age groups.', event_type: 'doctors-camp', venue: 'Patna Medical College & Hospital', event_date: '2026-09-12' },
    { id: 'fe5', title: 'IT Sector Event', description: 'IT conclave, startup showcase & tech workshops for students and professionals.', event_type: 'it-sector', venue: 'Bihar State IT Hub, Patna', event_date: '2026-09-18' },
  ];
  const displayEvents = govtEvents.length > 0 ? govtEvents : fallbackEvents;

  const fallbackReviews = [
    { id: 'f1', author_name: 'Ankit Raj', rating: 5, content: 'Aakash Tutorials is simply the best for Judiciary coaching in Patna. Highly recommend!', business: { name: 'Aakash Tutorials' } },
    { id: 'f2', author_name: 'Priya Sinha', rating: 5, content: 'Dr. SureshKumar explained everything so well. Truly professional and friendly.', business: { name: 'Dr. SureshKumar Dental Clinic' } },
    { id: 'f3', author_name: 'Rohit Kumar', rating: 5, content: 'Great place with amazing ambience and delicious food. Must visit with family!', business: { name: 'The Saffron Restaurant' } },
  ];

  const fallbackBlogPosts = [
    { id: 'f1', title: '5 New Cafes in Patna You Must Try in 2024', published_at: '2024-05-12T00:00:00.000000Z', slug: '' },
    { id: 'f2', title: 'New Coaching Batches Starting This Month', published_at: '2024-05-08T00:00:00.000000Z', slug: '' },
    { id: 'f3', title: "Patna's New Flyover: Traffic to Get Easier", published_at: '2024-05-05T00:00:00.000000Z', slug: '' },
  ];

  const formatBlogDate = (date: any) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };


  // Saved (bookmarked) businesses — persisted in localStorage
  const [savedBusinessIds, setSavedBusinessIds] = useState<number[]>([]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem('patna_finder_saved_businesses');
      if (saved) setSavedBusinessIds(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleSaveBusiness = (id: number) => {
    setSavedBusinessIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem('patna_finder_saved_businesses', JSON.stringify(next)); } catch {}
      return next;
    });
  };


  return (
    <main>
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden min-h-[400px] md:min-h-[480px]">
        {/* Full-width Background */}
        <div className="absolute inset-0 w-full h-full">
          {/* Patna Monument Background Image */}
          <Image
            src="/images/patna-monument1.png"
            alt="Patna Monument1"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
        </div>

        {/* Dark Overlay - Black from top, Navy blue from bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-[#1e3a5f]/40"></div>
        
        {/* Mobile-specific additional gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/40 via-transparent to-transparent md:hidden"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
          <div className="max-w-2xl">
            {/* Top Navigation Breadcrumb Style Text */}
            {/* <div className="flex items-center gap-4 mb-6 text-sm">
              <span>CODEVIXA</span>
            </div> */}
            
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-3 mt-5 py-5">
              Discover Patna's<br />
              <span className="text-amber-400">Best Businesses</span><br />
              & Hidden Gems
            </h1>

            <p className="text-lg text-gray-200 mb-8">
              Find trusted places, compare, read reviews<br />
              and choose the best
            </p>

            {/* Stats Row with Icons */}
            <div className="grid grid-cols-2 md:flex md:gap-8 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">500+</div>
                <div className="text-sm text-gray-300 flex items-center justify-center gap-1 mt-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Cities
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">10k+</div>
                <div className="text-sm text-gray-300 flex items-center justify-center gap-1 mt-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                  Businesses
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">100k+</div>
                <div className="text-sm text-gray-300 flex items-center justify-center gap-1 mt-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Reviews
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">4.5★</div>
                <div className="text-sm text-gray-300 flex items-center justify-center gap-1 mt-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Ratings
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories - Overlapping Hero */}
      <section className="relative bg-white -mt-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Explore Top Categories</h2>
              <Link href="/categories" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                View all categories →
              </Link>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {(categories.length > 0 ? categories.slice(0, 9) : []).map((category: any, index: number) => (
                <Link key={category.id} href={`/categories/${category.slug}`} className="flex flex-col items-center group">
                  <div className={`w-14 h-14 ${categoryColors[index % categoryColors.length]} rounded-2xl flex items-center justify-center mb-2 group-hover:shadow-lg group-hover:scale-105 transition-all`}>
                    <CategoryIcon icon={category.icon} className="w-7 h-7 text-gray-700" />
                  </div>
                  <span className="text-xs text-center font-medium text-gray-700 leading-tight">{category.name}</span>
                </Link>
              ))}

              {/* Loading placeholder until categories load */}
              {categories.length === 0 && [1,2,3,4,5,6,7,8,9].map((i) => (
                <div key={i} className="flex flex-col items-center animate-pulse">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-10"></div>
                </div>
              ))}

              {/* More */}
              <Link href="/categories" className="flex flex-col items-center group">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-2 group-hover:shadow-lg group-hover:scale-105 transition-all">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <span className="text-xs text-center font-medium text-gray-700 leading-tight">More</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Businesses */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">What&apos;s Trending in Patna This Month</h2>
            <Link href="/businesses" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
              See all businesses →
            </Link>
          </div>

          {trendingBusinesses.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {trendingBusinesses.slice(0, 5).map((business: any, index: number) => (
                <TrendingBusinessCard
                  key={business.id}
                  business={business}
                  rank={index + 1}
                  isSaved={savedBusinessIds.includes(business.id)}
                  onToggleSave={toggleSaveBusiness}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-40 bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Explore by Area */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Explore Patna By Area</h2>
            <Link href="/areas" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
              View all areas →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {(areas.length > 0 ? areas.slice(0, 7) : fallbackAreas).map((area: any) => (
              <Link
                key={area.id}
                href={`/areas/${area.slug}`}
                className="relative h-24 rounded-2xl overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>
                
                {/* Location Icon Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <div className="relative h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-white font-semibold text-sm mb-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {area.name}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-20 transition"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* People Are Searching For */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">People Are Searching For</h2>
          
          <div className="relative">
            {/* Left Arrow */}
            <button 
              onClick={() => {
                const container = document.getElementById('search-scroll');
                if (container) container.scrollLeft -= 300;
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Scrollable Container */}
            <div 
              id="search-scroll"
              className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {(popularSearches.length > 0 ? popularSearches : fallbackSearches).map((search: string, index: number) => (
                <Link
                  key={index}
                  href={`/search?q=${encodeURIComponent(search)}`}
                  className="px-6 py-2 bg-white border-2 border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-600 transition whitespace-nowrap flex-shrink-0"
                >
                  {search}
                </Link>
              ))}
            </div>

            {/* Right Arrow */}
            <button 
              onClick={() => {
                const container = document.getElementById('search-scroll');
                if (container) container.scrollLeft += 300;
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Compare Before You Choose */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            {/* Left Side - Text & Button */}
            <div className="md:col-span-3">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Compare Before<br />You Choose</h2>
              <p className="text-gray-600 text-sm mb-6">Compare the top businesses and make the right choice.</p>
              <Link href="/compare" className="bg-amber-400 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-amber-500 transition shadow-lg inline-block">
                View Comparisons
              </Link>
            </div>

            {/* Right Side - Comparison Pairs */}
            <div className="md:col-span-9 relative">
              {/* Left Arrow */}
              <button 
                onClick={() => {
                  const container = document.getElementById('compare-scroll');
                  if (container) container.scrollLeft -= 300;
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Scrollable Comparison Container */}
              <div 
                id="compare-scroll"
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
              >
                {/* Comparison Card 1 - Coaching */}
                <div className="flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-4 mb-4">
                    {/* Business 1 */}
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center mb-2 mx-auto">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <p className="font-bold text-xs text-gray-900">Aakash Tutorials</p>
                      <p className="text-xs text-gray-500">Patna</p>
                    </div>

                    {/* VS Badge */}
                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">VS</span>
                    </div>

                    {/* Business 2 */}
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center mb-2 mx-auto">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <p className="font-bold text-xs text-gray-900">The Hindustan</p>
                      <p className="text-xs text-gray-500">Patna</p>
                    </div>
                  </div>
                  
                  {/* Category Label */}
                  <div className="text-center mb-3">
                    <span className="text-xs text-blue-600 font-semibold">Coaching Institutes</span>
                  </div>

                  {/* View Comparison Button */}
                  <Link href="/compare" className="block w-full text-center text-xs text-blue-600 hover:text-blue-700 font-semibold py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                    View Comparison →
                  </Link>
                </div>

                {/* Comparison Card 2 - Dentists */}
                <div className="flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-2 mx-auto">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="font-bold text-xs text-gray-900">Dr. Suresh Kumar</p>
                      <p className="text-xs text-gray-500">Dental Clinic</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">VS</span>
                    </div>

                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center mb-2 mx-auto">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="font-bold text-xs text-gray-900">Smile Care</p>
                      <p className="text-xs text-gray-500">Dental Clinic</p>
                    </div>
                  </div>

                  <div className="text-center mb-3">
                    <span className="text-xs text-blue-600 font-semibold">Dentists</span>
                  </div>

                  <Link href="/compare" className="block w-full text-center text-xs text-blue-600 hover:text-blue-700 font-semibold py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                    View Comparison →
                  </Link>
                </div>

                {/* Comparison Card 3 - Hospitals */}
                <div className="flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mb-2 mx-auto">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="font-bold text-xs text-gray-900">Paras HMRI</p>
                      <p className="text-xs text-gray-500">Hospital</p>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">VS</span>
                    </div>

                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-pink-500 flex items-center justify-center mb-2 mx-auto">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="font-bold text-xs text-gray-900">Mediversal</p>
                      <p className="text-xs text-gray-500">Hospital</p>
                    </div>
                  </div>

                  <div className="text-center mb-3">
                    <span className="text-xs text-blue-600 font-semibold">Hospitals</span>
                  </div>

                  <Link href="/compare" className="block w-full text-center text-xs text-blue-600 hover:text-blue-700 font-semibold py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                    View Comparison →
                  </Link>
                </div>
              </div>

              {/* Right Arrow */}
              <button 
                onClick={() => {
                  const container = document.getElementById('compare-scroll');
                  if (container) container.scrollLeft += 300;
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hidden Gems & Recent Government Events - Combined Row */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            
            {/* Hidden Gems - Left Side */}
            <div className="grid grid-cols-12 gap-6 items-center">
              {/* Text Content - Left 6 cols */}
              <div className="col-span-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Hidden Gems<br />of Patna
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  Underrated places that deserve your attention.
                </p>
                <Link href="/explore" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition inline-block">
                  Explore Gems
                </Link>
              </div>

              {/* Images - Right 6 cols - Overlapping Collage */}
              <div className="col-span-6 relative h-64">
                {/* Image 1 - Top Left */}
                <div className="absolute top-0 left-0 w-40 h-40 rounded-2xl overflow-hidden shadow-lg z-10">
                  <Image
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRytGHDKiv-Ttf2el-ZKTHsINjFCvhDjMv__lh6DCSQ3dOuIHxN-of5RahL&s=10"
                    alt="Hidden Gem 1"
                    fill
                    className="object-cover"
                  />
                  {/* Fallback gradient if image not found */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-orange-400 -z-10"></div>
                </div>

                {/* Image 2 - Top Right */}
                <div className="absolute top-0 right-0 w-36 h-36 rounded-2xl overflow-hidden shadow-lg z-20">
                  <Image
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP6v-6UPR3SscyUCnj-3swyO98_37VphPHomR5bVpRxw&s=10"
                    alt="Hidden Gem 2"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-500 -z-10"></div>
                </div>

                {/* Image 3 - Bottom Left */}
                <div className="absolute bottom-8 left-8 w-32 h-32 rounded-2xl overflow-hidden shadow-lg z-30">
                  <Image
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzytlXTRBU99_9WrrKXLi3YBGb_twVBFZLZRtsk-YoxYBzyJWzauAEZVs&s=10"
                    alt="Hidden Gem 3"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-400 -z-10"></div>
                </div>

                {/* Image 4 - Bottom Right (larger) */}
                <div className="absolute bottom-0 right-8 w-40 h-40 rounded-2xl overflow-hidden shadow-xl z-40">
                  <Image
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_mUwPE31FlDyYYGb_ZxDFj6naxfRMJ-mes48n_kXRyvf3wKyUPdf_GxE&s=10"
                    alt="Hidden Gem 4"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-400 -z-10"></div>
                </div>

                {/* Yellow Lightbulb Icon Badge - On center image */}
                <div className="absolute bottom-16 right-20 w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center shadow-xl z-50">
                  <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Recent Government Events - Right Side (Dynamic Swipe Slider) */}
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    Recent Government Events
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3.5A1.5 1.5 0 0111.5 5v.5h3a2 2 0 012 2v7a2 2 0 01-2 2h-9a2 2 0 01-2-2v-7a2 2 0 012-2h3V5A1.5 1.5 0 0110 3.5zm-3.5 4a1 1 0 011-1h5a1 1 0 011 1V8h-7V7.5zm0 2.5h7v4.5a.5.5 0 01-.5.5H7a.5.5 0 01-.5-.5V10z" clipRule="evenodd" />
                    </svg>
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Stay updated with govt programmes, camps & functions across Patna.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="flex gap-2">
                    <button onClick={() => scrollEventsBy(-1)} aria-label="Previous event" className="w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button onClick={() => scrollEventsBy(1)} aria-label="Next event" className="w-8 h-8 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <Link href="/events" className="text-blue-600 hover:text-blue-700 text-sm font-semibold whitespace-nowrap">
                    View all events →
                  </Link>
                </div>
              </div>
              
              {/* Govt Events - Swiper Slider */}
              <div className="relative mb-8">
                <Swiper
                  modules={[Autoplay, Pagination]}
                  onSwiper={(sw) => { swiperRef.current = sw; }}
                  slidesPerView={1}
                  spaceBetween={16}
                  loop={displayEvents.length > 1}
                  autoplay={{ delay: 4000, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  className="events-swiper !pb-12"
                  style={{ '--swiper-theme-color': '#2563eb' } as any}
                >
                  {displayEvents.map((event: any) => {
                    const style = eventTypeStyles[event.event_type] || eventTypeStyles['other'];
                    return (
                      <SwiperSlide key={event.id}>
                        <div className="flex items-start gap-4 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:shadow-md hover:bg-white hover:border-gray-200 transition">
                          {/* Event Icon */}
                          <div className={`w-12 h-12 ${style.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <svg className={`w-6 h-6 ${style.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={style.icon} />
                            </svg>
                          </div>

                          {/* Event Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-sm text-gray-900">{event.title}</h4>
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 rounded-full px-2 py-0.5 shrink-0">Govt Event</span>
                            </div>
                            {event.description && (
                              <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">{event.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1 shrink-0">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
                                </svg>
                                {formatEventDate(event.event_date)}
                              </span>
                              {event.venue && (
                                <span className="flex items-center gap-1 min-w-0">
                                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span className="truncate">{event.venue}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>

              {/* View All Events Button */}
              <div className="text-center">
                <Link href="/events" className="bg-white border-2 border-gray-300 text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition inline-block">
                  View All Events
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Customer Reviews & Blog - Combined Row */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* What Patna Says - Left Side */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    What Patna Says
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Real reviews from real people.</p>
                </div>
                <Link href="/reviews" className="text-blue-600 hover:text-blue-700 text-sm font-semibold whitespace-nowrap">
                  View all reviews →
                </Link>
              </div>

              {/* Reviews - 3 Cards Side by Side */}
              <div className="grid grid-cols-3 gap-4">
                {(latestReviews.length > 0 ? latestReviews.slice(0, 3) : fallbackReviews).map((review: any) => (
                  <div key={review.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start gap-3 mb-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {(review.author_name || 'A').charAt(0).toUpperCase()}
                      </div>
                      
                      {/* Name and Stars */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900">{review.author_name}</h4>
                        <p className="text-xs text-gray-500 mb-1">{review.business?.name || 'Patna'}</p>
                        <div className="flex text-amber-400 text-xs">
                          {Array(Number(review.rating) || 5).fill('★').join('')}
                        </div>
                      </div>
                    </div>
                    
                    {/* Review Text */}
                    <p className="text-xs text-gray-700 leading-relaxed mb-3 line-clamp-3">{review.content}</p>
                    
                    {/* Business Name */}
                    <p className="text-xs text-gray-900 font-bold">{review.business?.name}</p>
                  </div>
                ))}
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-2 mt-4">
                <button className="w-2 h-2 rounded-full bg-blue-600"></button>
                <button className="w-2 h-2 rounded-full bg-gray-300"></button>
                <button className="w-2 h-2 rounded-full bg-gray-300"></button>
              </div>
            </div>

            {/* Patna Pulse Blog - Right Side */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Patna Pulse
                    <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                    </svg>
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Your daily dose of local updates, stories & events.</p>
                </div>
                <Link href="/blog" className="text-blue-600 hover:text-blue-700 text-sm font-semibold whitespace-nowrap">
                  View all articles →
                </Link>
              </div>

              {/* Blog Posts - 3 Cards Grid */}
              <div className="grid grid-cols-3 gap-4">
                {(blogPosts.length > 0 ? blogPosts.slice(0, 3) : fallbackBlogPosts).map((post: any) => (
                  <Link key={post.id} href={post.slug ? `/blog/${post.slug}` : '/blog'} className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group">
                    {/* Blog Image - Top */}
                    <div className="relative w-full h-40">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image.startsWith('http') ? post.featured_image : `${API_BASE_URL}${post.featured_image}`}
                          alt={post.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-400"></div>
                      )}

                      {/* NEW Badge */}
                      {post.badge && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded">
                          {post.badge}
                        </div>
                      )}
                    </div>
                    
                    {/* Blog Content - Bottom */}
                    <div className="p-4">
                      <h3 className="font-bold text-sm text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-500">{formatBlogDate(post.published_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section - Own a Business */}
      <section className="bg-gradient-to-r from-[#0A1929] via-[#0F2744] to-[#1A3A5C] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0D1F35] rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              {/* Left - Shop Illustration */}
              <div className="md:col-span-3 flex justify-center">
                <div className="relative w-48 h-48">
                  {/* Shop Illustration with SVG */}
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Location Pin Background */}
                    <ellipse cx="100" cy="60" rx="40" ry="50" fill="#FF5757" opacity="0.9"/>
                    <circle cx="100" cy="50" r="12" fill="white"/>
                    
                    {/* Shop Building */}
                    <rect x="60" y="100" width="80" height="60" fill="#FF8B5B" rx="4"/>
                    <rect x="60" y="95" width="80" height="10" fill="#E85D3F" rx="2"/>
                    
                    {/* Awning Stripes */}
                    <rect x="60" y="95" width="8" height="10" fill="#FF6B6B"/>
                    <rect x="76" y="95" width="8" height="10" fill="#FF6B6B"/>
                    <rect x="92" y="95" width="8" height="10" fill="#FF6B6B"/>
                    <rect x="108" y="95" width="8" height="10" fill="#FF6B6B"/>
                    <rect x="124" y="95" width="8" height="10" fill="#FF6B6B"/>
                    
                    {/* Door */}
                    <rect x="85" y="125" width="30" height="35" fill="#8B4513" rx="2"/>
                    <circle cx="108" cy="142" r="2" fill="#FFD700"/>
                    
                    {/* Windows */}
                    <rect x="65" y="110" width="12" height="12" fill="#87CEEB" rx="1"/>
                    <rect x="123" y="110" width="12" height="12" fill="#87CEEB" rx="1"/>
                    
                    {/* Trees */}
                    <circle cx="40" cy="145" r="12" fill="#4CAF50"/>
                    <rect x="37" y="145" width="6" height="15" fill="#8B4513"/>
                    
                    <circle cx="160" cy="145" r="12" fill="#4CAF50"/>
                    <rect x="157" y="145" width="6" height="15" fill="#8B4513"/>
                  </svg>
                </div>
              </div>

              {/* Center - Heading & Description */}
              <div className="md:col-span-5 text-white">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3">Own a Business in Patna?</h2>
                <p className="text-gray-300 text-base mb-6">
                  Get discovered by thousands of potential customers.<br />
                  List your business today!
                </p>
                <Link href="/dashboard/add-business" className="bg-amber-400 text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-500 transition shadow-lg text-base inline-block">
                  Add Your Business
                </Link>
              </div>

              {/* Right - Benefits List */}
              <div className="md:col-span-4 space-y-4">
                {/* 100% Free Listing */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 6.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                    </svg>
                  </div>
                  <span className="text-white font-semibold">100% Free Listing</span>
                </div>

                {/* Reach More Customers */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold">Reach More Customers</span>
                </div>

                {/* Grow Your Business */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-white font-semibold">Grow Your Business</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
