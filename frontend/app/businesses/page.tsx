'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import TrendingBusinessCard from '@/components/TrendingBusinessCard';



const SORT_OPTIONS = [
  { label: 'Most Trending', sort_by: 'popular', sort_order: 'desc' },
  { label: 'Highest Rated', sort_by: 'rating', sort_order: 'desc' },
  { label: 'Most Reviewed', sort_by: 'review_count', sort_order: 'desc' },
  { label: 'Newest', sort_by: 'created_at', sort_order: 'desc' },
];

const RATING_FILTERS = [
  { label: '5 stars', value: 5, stars: '⭐⭐⭐⭐⭐' },
  { label: '4 & above', value: 4, stars: '⭐⭐⭐⭐' },
  { label: '3 & above', value: 3, stars: '⭐⭐⭐' },
  { label: '2 & above', value: 2, stars: '⭐⭐' },
  { label: '1 & above', value: 1, stars: '⭐' },
];


export default function AllBusinessesPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<number[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sort, setSort] = useState(SORT_OPTIONS[0]);
  const [openNow, setOpenNow] = useState(false);
  const [acceptsBookings, setAcceptsBookings] = useState(false);
  const [hasOffers, setHasOffers] = useState(false);

  // Expand/Collapse states
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [areaExpanded, setAreaExpanded] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllAreas, setShowAllAreas] = useState(false);
  const [areaSearchQuery, setAreaSearchQuery] = useState('');

  // Pagination
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  // Saved businesses
  const [savedIds, setSavedIds] = useState<number[]>([]);

  // Category counts (mock data - you can get from API)
  const getCategoryCount = (catId: number) => {
    return businesses.filter(b => b.category?.id === catId).length;
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('patna_finder_saved_businesses');
      if (saved) setSavedIds(JSON.parse(saved));
    } catch {}
  }, []);

  const toggleSave = (id: number) => {
    setSavedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem('patna_finder_saved_businesses', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  useEffect(() => {
    api.getCategories()
      .then(d => setCategories(Array.isArray(d) ? d : d.data || []))
      .catch(() => {});
    api.getAreas()
      .then(d => setAreas(Array.isArray(d) ? d : d.data || []))
      .catch(() => {});
  }, []);

  const fetchBusinesses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { per_page: perPage, page };
      if (search) params.search = search;
      if (selectedCategories.length > 0) params.category_id = selectedCategories[0];
      if (selectedAreas.length > 0) params.area_id = selectedAreas[0];
      if (selectedRating) params.min_rating = selectedRating;
      if (openNow) params.open_now = 1;
      params.sort_by = sort.sort_by;
      params.sort_order = sort.sort_order;

      const data: any = await api.getBusinesses(params);
      setBusinesses(Array.isArray(data) ? data : data.data || []);
      setTotal(Array.isArray(data) ? data.length : data.total || 0);
      setCurrentPage(Array.isArray(data) ? 1 : data.current_page || 1);
      setLastPage(Array.isArray(data) ? 1 : data.last_page || 1);
    } catch (error) {
      console.error('Failed to load businesses:', error);
      setBusinesses([]);
      setTotal(0);
      setCurrentPage(1);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategories, selectedAreas, selectedRating, openNow, sort, perPage]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(1);
    }, 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    fetchBusinesses(currentPage);
  }, [fetchBusinesses, currentPage]);

  const handleClearFilters = () => {
    setSearchInput('');
    setSearch('');
    setSelectedCategories([]);
    setSelectedAreas([]);
    setSelectedRating(null);
    setOpenNow(false);
    setAcceptsBookings(false);
    setHasOffers(false);
    setSort(SORT_OPTIONS[0]);
    setCurrentPage(1);
  };

  const toggleCategory = (catId: number) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
    setCurrentPage(1);
  };

  const toggleArea = (areaId: number) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
    );
    setCurrentPage(1);
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > lastPage || p === currentPage) return;
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageList = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(lastPage - 1, currentPage + 1);
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < lastPage - 1) pages.push('...');
      pages.push(lastPage);
    }
    return pages;
  };

  const hasFilters = Boolean(
    searchInput || selectedCategories.length > 0 || selectedAreas.length > 0 || 
    selectedRating || openNow || acceptsBookings || hasOffers || sort.label !== SORT_OPTIONS[0].label
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero with Background Image */}
      <section className="relative text-white py-20 md:py-24 overflow-hidden">
        {/* Background Image - Same as Home Page */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/images/patna-monument1.png"
            alt="Patna Monument"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Dark Overlay - Black from top, Navy blue from bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-[#1e3a5f]/40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-4 text-gray-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>›</span>
            <Link href="/explore" className="hover:text-white">Explore</Link>
            <span>›</span>
            <span className="text-white">Trending in Patna</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            Trending in <span className="text-amber-400">Patna</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl">
            Explore the most popular and trending businesses in Patna<br />
            based on reviews, searches and community love.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">1,250+</div>
                <div className="text-xs text-gray-400">Trending Businesses</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">10K+</div>
                <div className="text-xs text-gray-400">Happy Reviews</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">100K+</div>
                <div className="text-xs text-gray-400">Happy Users</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-400/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xl font-bold">4.8</div>
                <div className="text-xs text-gray-400">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search business, service or keyword..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
            
            <select
              value={selectedCategories[0] || ''}
              onChange={(e) => setSelectedCategories(e.target.value ? [Number(e.target.value)] : [])}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-bold bg-white"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
              value={selectedAreas[0] || ''}
              onChange={(e) => setSelectedAreas(e.target.value ? [Number(e.target.value)] : [])}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-bold bg-white"
            >
              <option value="">All Areas</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>

            <select
              value={selectedRating || ''}
              onChange={(e) => setSelectedRating(e.target.value ? Number(e.target.value) : null)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-bold bg-white"
            >
              <option value="">All Ratings</option>
              {RATING_FILTERS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>

            <button
              onClick={() => setOpenNow(!openNow)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-2 transition ${
                openNow ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {/* Toggle Icon */}
              <div className={`relative w-9 h-5 rounded-full transition ${openNow ? 'bg-white/30' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${openNow ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              Open Now
            </button>

            <button
              onClick={() => fetchBusinesses(1)}
              className="px-6 py-2.5 bg-[#081C3A] text-white rounded-lg text-sm font-medium whitespace-nowrap hover:bg-[#0a2448] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Apply Filters
            </button>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Filters</h3>
                {hasFilters && (
                  <button onClick={handleClearFilters} className="text-xs text-orange-600 hover:text-orange-700">
                    Clear All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-4 border-b border-gray-200 pb-3">
                <button 
                  onClick={() => setCategoryExpanded(!categoryExpanded)}
                  className="flex items-center justify-between w-full text-left mb-2"
                >
                  <h4 className="font-bold text-xs text-gray-900">Category</h4>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform ${categoryExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {categoryExpanded && (
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedCategories.length === 0}
                          onChange={() => setSelectedCategories([])}
                          className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs text-blue-600 font-bold">All Categories</span>
                      </div>
                      <span className="text-xs text-gray-500 font-semibold">{businesses.length}</span>
                    </label>
                    
                    {/* Show first 7 categories or all based on state */}
                    {(showAllCategories ? categories : categories.slice(0, 7)).map(cat => (
                      <label key={cat.id} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.id)}
                            onChange={() => toggleCategory(cat.id)}
                            className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700 font-medium">{cat.name}</span>
                        </div>
                        <span className="text-xs text-gray-400 font-semibold">{getCategoryCount(cat.id)}</span>
                      </label>
                    ))}
                    
                    {/* View More Button */}
                    {categories.length > 7 && (
                      <button 
                        onClick={() => setShowAllCategories(!showAllCategories)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-bold mt-1 ml-2"
                      >
                        {showAllCategories ? 'View Less' : 'View More'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Area Filter */}
              <div className="mb-4 border-b border-gray-200 pb-3">
                <button 
                  onClick={() => setAreaExpanded(!areaExpanded)}
                  className="flex items-center justify-between w-full text-left mb-2"
                >
                  <h4 className="font-bold text-xs text-gray-900">Area</h4>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform ${areaExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {areaExpanded && (
                  <div className="space-y-2">
                    {/* Search Input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search area"
                        value={areaSearchQuery}
                        onChange={(e) => setAreaSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <svg 
                        className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedAreas.length === 0}
                            onChange={() => setSelectedAreas([])}
                            className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-blue-600 font-bold">All Areas</span>
                        </div>
                      </label>
                      
                      {/* Show first 7 areas or all based on state, filtered by search */}
                      {(showAllAreas ? areas : areas.slice(0, 7))
                        .filter(area => area.name.toLowerCase().includes(areaSearchQuery.toLowerCase()))
                        .map(area => {
                          const areaCount = businesses.filter(b => b.area_id === area.id).length;
                          return (
                            <label key={area.id} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedAreas.includes(area.id)}
                                  onChange={() => toggleArea(area.id)}
                                  className="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-xs text-gray-700 font-medium">{area.name}</span>
                              </div>
                              <span className="text-xs text-gray-400 font-semibold">{areaCount}</span>
                            </label>
                          );
                        })}
                      
                      {/* View More Button */}
                      {areas.length > 7 && (
                        <button 
                          onClick={() => setShowAllAreas(!showAllAreas)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-bold mt-1 ml-2"
                        >
                          {showAllAreas ? 'View Less' : 'View More'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Ratings Filter */}
              <div className="mb-4 border-b border-gray-200 pb-3">
                <h4 className="font-bold text-xs text-gray-900 mb-2">Ratings</h4>
                <div className="space-y-1.5">
                  {RATING_FILTERS.map(rating => (
                    <label key={rating.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                      <input
                        type="radio"
                        name="rating"
                        checked={selectedRating === rating.value}
                        onChange={() => setSelectedRating(rating.value)}
                        className="w-3.5 h-3.5 text-blue-600"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-3 h-3 ${i < rating.value ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-600 font-medium ml-0.5">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Other Filters */}
              <div>
                <h4 className="font-bold text-xs text-gray-900 mb-2">Other Filters</h4>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                    <input
                      type="checkbox"
                      checked={openNow}
                      onChange={(e) => setOpenNow(e.target.checked)}
                      className="w-3.5 h-3.5 text-blue-600 rounded"
                    />
                    <span className="text-xs text-gray-700 font-medium">Open Now</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                    <input
                      type="checkbox"
                      checked={acceptsBookings}
                      onChange={(e) => setAcceptsBookings(e.target.checked)}
                      className="w-3.5 h-3.5 text-blue-600 rounded"
                    />
                    <span className="text-xs text-gray-700 font-medium">Accepts Bookings</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                    <input
                      type="checkbox"
                      checked={hasOffers}
                      onChange={(e) => setHasOffers(e.target.checked)}
                      className="w-3.5 h-3.5 text-blue-600 rounded"
                    />
                    <span className="text-xs text-gray-700 font-medium">Has Offers</span>
                  </label>
                </div>
              </div>

              {hasFilters && (
                <button
                  onClick={handleClearFilters}
                  className="w-full mt-6 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Right Content - Business Listings */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-xl font-bold text-gray-900">All Trending Businesses</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Showing {((currentPage - 1) * perPage) + 1}-{Math.min(currentPage * perPage, total)} of {total} results</span>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sort.label}
                    onChange={(e) => {
                      const opt = SORT_OPTIONS.find(o => o.label === e.target.value) || SORT_OPTIONS[0];
                      setSort(opt);
                    }}
                    className="text-xs font-bold text-gray-900 border-0 focus:ring-0 bg-transparent cursor-pointer"
                  >
                    {SORT_OPTIONS.map(o => <option key={o.label} value={o.label}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <span className="text-sm text-gray-600 font-medium">Share this page:</span>
              <div className="flex items-center gap-2">
                {/* WhatsApp Share */}
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent('Check out trending businesses in Patna!');
                    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                  }}
                  className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition"
                  aria-label="Share on WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                </button>

                {/* Facebook Share */}
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                  }}
                  className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition"
                  aria-label="Share on Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </button>

                {/* Twitter Share */}
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent('Check out trending businesses in Patna!');
                    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
                  }}
                  className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition"
                  aria-label="Share on Twitter"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                </button>

                {/* LinkedIn Share */}
                <button
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
                  }}
                  className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </button>

                {/* Copy Link */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition"
                  aria-label="Copy link"
                  title="Copy link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
                    <div className="h-44 bg-gray-100"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : businesses.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters</p>
                {hasFilters && (
                  <button onClick={handleClearFilters} className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {businesses.map((business, index) => {
                    const rankNumber = ((currentPage - 1) * perPage) + index + 1;
                    return (
                      <TrendingBusinessCard
                        key={business.id}
                        business={business}
                        rank={rankNumber <= 20 ? rankNumber : undefined}
                        isSaved={savedIds.includes(business.id)}
                        onToggleSave={toggleSave}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="flex items-center justify-between mt-8">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>

                    <div className="flex items-center gap-1">
                      {getPageList().map((p, idx) =>
                        typeof p === 'number' ? (
                          <button
                            key={idx}
                            onClick={() => goToPage(p)}
                            className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                              p === currentPage
                                ? 'bg-amber-400 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {p}
                          </button>
                        ) : (
                          <span key={idx} className="px-2 text-gray-400">...</span>
                        )
                      )}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= lastPage}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      →
                    </button>

                    <select
                      value={perPage}
                      onChange={(e) => setPerPage(Number(e.target.value))}
                      className="ml-4 px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold"
                    >
                      <option value={12}>12 per page</option>
                      <option value={24}>24 per page</option>
                      <option value={36}>36 per page</option>
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Don't see your business CTA */}
      <section className="bg-gradient-to-r from-orange-50 to-amber-50 border-y border-orange-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <rect x="20" y="80" width="60" height="80" fill="#FF6B35" rx="4"/>
                  <rect x="90" y="60" width="60" height="100" fill="#FFB627" rx="4"/>
                  <rect x="160" y="70" width="20" height="90" fill="#4ECDC4" rx="4"/>
                  <circle cx="50" cy="40" r="15" fill="#FF6B35"/>
                  <circle cx="120" cy="30" r="12" fill="#FFB627"/>
                  <path d="M 50 60 L 80 80 L 50 100" stroke="#FFF" strokeWidth="4" fill="none"/>
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Don't see your business here?</h3>
                <p className="text-gray-600">List your business for free and reach thousands of<br/>potential customers in Patna.</p>
              </div>
            </div>
            <Link
              href="/dashboard/add-business"
              className="px-8 py-3 bg-amber-400 text-gray-900 font-bold rounded-lg hover:bg-amber-500 transition flex items-center gap-2 whitespace-nowrap"
            >
              Add Your Business
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
