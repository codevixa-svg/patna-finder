'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import CategoryIcon from '@/components/CategoryIcon';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/images/event-placeholder.jpg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('/storage/')) return `${API_BASE_URL}${imagePath}`;
  if (imagePath.startsWith('storage/')) return `${API_BASE_URL}/${imagePath}`;
  if (imagePath.startsWith('/')) return `${API_BASE_URL}${imagePath}`;
  return `${API_BASE_URL}/storage/${imagePath}`;
};

const CATEGORY_ICONS: Record<string, string> = {
  'All Events': 'calendar',
  'Cultural': 'clapperboard',
  'Literary': 'book-open',
  'Education': 'graduation-cap',
  'Job & Career': 'briefcase',
  'Government': 'landmark',
  'Music & Entertainment': 'music',
  'Sports & Fitness': 'dumbbell',
  'Business & Networking': 'handshake',
  'Community': 'users',
  'Food & Lifestyle': 'utensils',
};

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedPriceType, setSelectedPriceType] = useState('');
  const [dateFilter, setDateFilter] = useState('upcoming');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchEvents();
    fetchFiltersData();
  }, [search, selectedCategory, selectedDate, selectedArea, selectedMode, selectedPriceType, dateFilter, currentPage]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, per_page: 12 };
      
      if (search) params.search = search;
      if (selectedCategory) params.event_category = selectedCategory;
      if (selectedArea) params.area = selectedArea;
      if (selectedMode) params.event_mode = selectedMode;
      if (selectedPriceType) params.price_type = selectedPriceType;
      if (dateFilter) params.date_filter = dateFilter;

      const response = await api.getEvents(params);
      setEvents(response.data || []);
      setCurrentPage(response.current_page || 1);
      setLastPage(response.last_page || 1);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltersData = async () => {
    try {
      const [categoriesRes, areasRes, statsRes] = await Promise.all([
        api.getEventCategories(),
        api.getEventAreas(),
        api.getEventStats(),
      ]);

      setCategories(categoriesRes.data || []);
      setAreas(areasRes.data || []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error('Failed to fetch filter data:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return { day, month };
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section 
        className="relative text-white py-8"
        style={{
          backgroundImage: 'url(/images/events-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-4">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <Link href="/" className="hover:text-[#F4B400] transition">Home</Link>
            <span>&gt;</span>
            <span>Events</span>
            <span>&gt;</span>
            <span className="font-semibold">Events in Patna</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            Events in <span className="text-[#F4B400]">Patna</span>
          </h1>
          <p className="text-xs md:text-sm text-gray-200 mb-5 max-w-3xl">
            Discover and be a part of the most exciting events in Patna – from cultural festivals and literary meets to career fairs and more.
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="flex items-center gap-2 md:gap-3 text-white">
              <div className="bg-[#0B3A63]/20 backdrop-blur-sm rounded-lg p-2 border border-[#F4B400]/30">
                <svg className="w-5 h-5 text-[#F4B400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold">{stats?.total_upcoming || '15'}+</div>
                <div className="text-[10px] md:text-xs text-gray-300">Upcoming Events</div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 text-white">
              <div className="bg-[#0B3A63]/20 backdrop-blur-sm rounded-lg p-2 border border-[#F4B400]/30">
                <svg className="w-5 h-5 text-[#F4B400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold">{stats?.total_attendees || '17720'}+</div>
                <div className="text-[10px] md:text-xs text-gray-300">Event Attendees</div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 text-white">
              <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-2 border border-yellow-400/30">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold">4.8</div>
                <div className="text-[10px] md:text-xs text-gray-300">Community Rating</div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 text-white">
              <div className="bg-[#0B3A63]/20 backdrop-blur-sm rounded-lg p-2 border border-[#F4B400]/30">
                <svg className="w-5 h-5 text-[#F4B400]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div className="text-lg md:text-xl font-bold">Patna</div>
                <div className="text-[10px] md:text-xs text-gray-300">Events Across the City</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/50">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
              <div className="md:col-span-3 relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search events, venue or organizer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3A63] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3A63] focus:border-transparent appearance-none bg-white cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="">All Categories</option>
                  {Object.keys(CATEGORY_ICONS).filter(c => c !== 'All Events').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3A63] focus:border-transparent appearance-none bg-white cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="upcoming">All Dates</option>
                  <option value="today">Today</option>
                  <option value="this_weekend">This Weekend</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B3A63] focus:border-transparent appearance-none bg-white cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="">All Areas</option>
                  {areas.map((area: any) => (
                    <option key={area.area} value={area.area}>{area.area}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <button className="w-full bg-[#062B49] hover:bg-[#062B49] text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-[#062B49]/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Icons */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {Object.entries(CATEGORY_ICONS).map(([category, icon]) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'All Events' ? '' : category)}
                className={`flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-lg transition ${
                  (category === 'All Events' && !selectedCategory) || selectedCategory === category
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <CategoryIcon icon={icon} className="w-8 h-8" />
                <div className="text-xs font-medium text-center whitespace-nowrap">{category}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedArea('');
                    setSelectedMode('');
                    setSelectedPriceType('');
                    setDateFilter('upcoming');
                    setSearch('');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>

              {/* Event Type */}
              <div className="mb-6 border-b border-gray-200 pb-4">
                <h4 className="font-bold text-xs text-gray-900 mb-2">Event Type</h4>
                <div className="space-y-1.5">
                  {categories.slice(0, 10).map((cat: any) => (
                    <label key={cat.event_category} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="category"
                          checked={selectedCategory === cat.event_category}
                          onChange={() => setSelectedCategory(cat.event_category)}
                          className="w-3.5 h-3.5 text-blue-600"
                        />
                        <span className="text-xs text-gray-700 font-medium">{cat.event_category}</span>
                      </div>
                      <span className="text-xs text-gray-400 font-semibold">{cat.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Event Mode */}
              <div className="mb-6 border-b border-gray-200 pb-4">
                <h4 className="font-bold text-xs text-gray-900 mb-2">Event Mode</h4>
                <div className="space-y-1.5">
                  {['offline', 'online', 'hybrid'].map(mode => (
                    <label key={mode} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                      <input
                        type="radio"
                        name="mode"
                        checked={selectedMode === mode}
                        onChange={() => setSelectedMode(mode)}
                        className="w-3.5 h-3.5 text-blue-600"
                      />
                      <span className="text-xs text-gray-700 font-medium capitalize">{mode}</span>
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
                      checked={selectedPriceType === 'free'}
                      onChange={(e) => setSelectedPriceType(e.target.checked ? 'free' : '')}
                      className="w-3.5 h-3.5 text-blue-600 rounded"
                    />
                    <span className="text-xs text-gray-700 font-medium">Free Events</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Event Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  📅 Upcoming Events in Patna
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Showing {events.length} of {total} events
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Date (Newest First)</option>
                  <option>Date (Oldest First)</option>
                  <option>Most Popular</option>
                </select>

                <div className="flex gap-2">
                  <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                {/* Event Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {events.map((event: any) => {
                    const { day, month } = formatDate(event.event_date);
                    
                    return (
                      <Link 
                        key={event.id} 
                        href={`/event/${event.id}`}
                        className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                      >
                        {/* Event Image */}
                        <div className="relative h-36 overflow-hidden">
                          <img
                            src={getImageUrl(event.featured_image)}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          
                          {/* Date Badge */}
                          <div className="absolute top-2.5 left-2.5 bg-white rounded-lg shadow-lg p-1.5 text-center min-w-[50px]">
                            <div className="text-xl font-bold text-gray-900 leading-none">{day}</div>
                            <div className="text-[9px] font-bold text-blue-600 uppercase mt-0.5">{month}</div>
                          </div>

                          {/* Bookmark */}
                          <button className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition">
                            <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                        </div>

                        {/* Event Details */}
                        <div className="p-3">
                          <h3 className="font-bold text-sm text-gray-900 mb-2.5 line-clamp-2 group-hover:text-blue-600 transition min-h-[40px]">
                            {event.title}
                          </h3>

                          <div className="space-y-1.5 text-xs text-gray-600 mb-3">
                            <div className="flex items-start gap-1.5">
                              <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="line-clamp-1 text-[11px]">{event.venue || event.area}, {event.city}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-[11px]">{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span className="font-semibold text-[11px] text-gray-700">{event.interested_count || 0} Interested</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                            <div>
                              {event.price_type === 'free' ? (
                                <span className="inline-flex items-center px-2.5 py-1 bg-[#FFF4CC] text-[#062B49] text-[10px] font-bold rounded-full">
                                  Free
                                </span>
                              ) : (
                                <div className="flex flex-col">
                                  <span className="text-[9px] text-orange-600 font-semibold">Paid</span>
                                  <span className="text-xs font-bold text-orange-700">₹{event.price}</span>
                                </div>
                              )}
                            </div>

                            <button className="text-blue-600 text-[11px] font-bold hover:text-blue-700 flex items-center gap-1 hover:gap-1.5 transition-all">
                              View Details
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {lastPage > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {[...Array(Math.min(5, lastPage))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(Math.min(lastPage, currentPage + 1))}
                      disabled={currentPage === lastPage}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="space-y-6 sticky top-4">
              {/* Event Calendar Widget */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Calendar Header */}
                <div className="bg-gradient-to-r from-[#F7F9FC] to-[#FFF4CC] px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#062B49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-bold text-sm text-gray-800">Event Calendar</h3>
                  </div>
                </div>
                
                <div className="p-4">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-base text-gray-900">
                      {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <div className="flex gap-2">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition">
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div>
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center font-semibold text-gray-500 text-[11px] py-1">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {(() => {
                        const today = new Date();
                        const year = today.getFullYear();
                        const month = today.getMonth();
                        const firstDay = new Date(year, month, 1).getDay();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const days = [];
                        
                        // Empty cells for days before month starts
                        for (let i = 0; i < firstDay; i++) {
                          days.push(
                            <div key={`empty-${i}`} className="aspect-square"></div>
                          );
                        }
                        
                        // Days of the month
                        for (let day = 1; day <= daysInMonth; day++) {
                          const isToday = day === today.getDate();
                          const isPast = day < today.getDate();
                          
                          days.push(
                            <button
                              key={day}
                              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition ${
                                isToday
                                  ? 'bg-[#062B49] text-white font-bold shadow-md'
                                  : isPast
                                  ? 'text-gray-300 cursor-default'
                                  : 'text-gray-700 hover:bg-[#FFF9E5] hover:text-[#062B49] hover:font-semibold'
                              }`}
                              disabled={isPast && !isToday}
                            >
                              {day}
                            </button>
                          );
                        }
                        
                        return days;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Popular Events */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-bold text-sm text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Popular Events
                </h3>
                <div className="space-y-3">
                  {events.slice(0, 5).map((event: any) => {
                    const { day, month } = formatDate(event.event_date);
                    return (
                      <Link
                        key={event.id}
                        href={`/event/${event.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                      >
                        <img
                          src={getImageUrl(event.featured_image)}
                          alt={event.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {event.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {day} {month} • {formatTime(event.start_time)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-[#FFF9E5] to-blue-50 rounded-lg border border-[#FFF4CC] p-4">
                <h3 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#062B49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Never Miss an Event
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Get the latest event updates, tickets, and offers right in your inbox.
                </p>
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#0B3A63]"
                />
                <button className="w-full bg-[#062B49] hover:bg-[#062B49] text-white font-semibold py-2 px-4 rounded-lg transition text-xs">
                  Subscribe
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
