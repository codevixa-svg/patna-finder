'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { api, API_BASE_URL } from '@/lib/api';
import { pickCategoryColorPair } from '@/lib/categoryColors';
import CategoryIcon from '@/components/CategoryIcon';
import Breadcrumbs from '@/components/Breadcrumbs';

// Build an absolute image URL from backend storage paths (/storage/...)
const buildImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/storage/')) return `${API_BASE_URL}${path}`;
  if (path.startsWith('storage/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const SORT_OPTIONS = [
  { value: 'most_businesses', label: 'Most Businesses' },
  { value: 'name_asc', label: 'Name (A–Z)' },
  { value: 'name_desc', label: 'Name (Z–A)' },
];

// 1234 → "1.2k"
const formatCount = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

export default function AreasPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('most_businesses');

  useEffect(() => {
    let cancelled = false;

    async function fetchAreas() {
      try {
        const data = await api.getAreas();
        if (!cancelled) setAreas(Array.isArray(data) ? data : data?.data || []);
      } catch {
        if (!cancelled) setAreas([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAreas();
    return () => {
      cancelled = true;
    };
  }, []);

  // Client-side search + sort over the full area list
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = areas;
    if (q) {
      list = list.filter(
        (a) =>
          a.name?.toLowerCase().includes(q) ||
          a.description?.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (sort === 'most_businesses') {
      sorted.sort(
        (a, b) =>
          (b.businesses_count || 0) - (a.businesses_count || 0) ||
          (a.name || '').localeCompare(b.name || ''),
      );
    } else if (sort === 'name_desc') {
      sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    } else {
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    return sorted;
  }, [areas, search, sort]);

  // Hero stats derived from the fetched list
  const stats = useMemo(() => {
    const businesses = areas.reduce((sum, a) => sum + (a.businesses_count || 0), 0);
    const categorySet = new Set<string>();
    areas.forEach((a) =>
      (a.top_categories || []).forEach((c: any) => c.name && categorySet.add(c.name)),
    );
    return { areas: areas.length, businesses, categories: categorySet.size };
  }, [areas]);

  const popular = useMemo(
    () =>
      [...areas]
        .sort((a, b) => (b.businesses_count || 0) - (a.businesses_count || 0))
        .slice(0, 4),
    [areas],
  );

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <Breadcrumbs items={[{ label: 'Areas' }]} />
      <HeroSection stats={stats} loading={loading} popular={popular} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <SearchToolbar
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          onSortChange={setSort}
          resultCount={visible.length}
          totalCount={areas.length}
        />
        <AreasGrid
          areas={visible}
          loading={loading}
          search={search}
          onClearSearch={() => setSearch('')}
        />
      </section>
      <ExploreMoreSection />
    </main>
  );
}

/* ───────────────────────────── Hero ───────────────────────────── */
function HeroSection({
  stats,
  loading,
  popular,
}: {
  stats: { areas: number; businesses: number; categories: number };
  loading: boolean;
  popular: any[];
}) {
  const statItems = [
    {
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
      value: loading ? '—' : formatCount(stats.areas),
      label: 'Areas Covered',
    },
    {
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      value: loading ? '—' : `${formatCount(stats.businesses)}+`,
      label: 'Businesses Listed',
    },
    {
      icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z',
      value: loading ? '—' : stats.categories > 0 ? `${stats.categories}+` : '—',
      label: 'Categories',
    },
  ];

  return (
    <section className="bg-[#FFFBEB] border-b border-[#FFF4CC]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: text + stats */}
          <div>
            <span className="inline-flex items-center gap-2 bg-white shadow-sm border border-[#FFF4CC] rounded-full px-4 py-1.5 text-sm font-semibold text-[#062B49]">
              <svg className="w-4 h-4 text-[#D89E00]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Area Guides
            </span>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#062B49] mt-4 leading-tight">
              Explore Patna <span className="text-[#D89E00]">by Area</span>
            </h1>

            <p className="mt-4 text-gray-600 leading-relaxed max-w-xl">
              From the coaching hubs of Boring Road to the food streets of Kankarbagh — pick a
              locality and discover its best businesses, services and hidden gems.
            </p>

            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4">
              {statItems.map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-full bg-[#062B49] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#F4B400]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                    </svg>
                  </span>
                  <span>
                    <span className="block font-heading text-lg font-extrabold text-[#062B49] leading-tight">{s.value}</span>
                    <span className="block text-xs text-gray-500">{s.label}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: most active areas */}
          <div className="bg-white rounded-3xl border border-[#FFF4CC] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-[18px] h-[18px] text-[#D89E00]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-[#062B49]">
                Most Active Areas
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[58px] bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : popular.length === 0 ? (
              <p className="text-sm text-gray-500">Area data will appear once businesses are listed.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {popular.map((a, i) => (
                  <Link
                    key={a.id}
                    href={`/areas/${a.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-[#FFF9E5] hover:border-[#FFF4CC] px-3 py-2.5 transition-colors group"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#062B49] text-[#F4B400] text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold text-[#062B49] truncate">{a.name}</span>
                      <span className="block text-xs text-gray-500">
                        {formatCount(a.businesses_count || 0)} businesses
                      </span>
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-[#D89E00] transition-colors flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Search & sort toolbar ───────────────────── */
function SearchToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  resultCount,
  totalCount,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-8">
      {/* Search */}
      <div className="relative flex-1 md:max-w-md">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 w-[18px] h-[18px] text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2 6a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search areas, e.g. Boring Road, Kankarbagh…"
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#062B49] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFF4CC] focus:border-[#FFDF80] transition"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Sort + result count */}
      <div className="flex items-center justify-between md:justify-end gap-4">
        <p className="text-sm text-gray-500 md:hidden">
          {resultCount} of {totalCount} areas
        </p>
        <label className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-gray-500">Sort by</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#062B49] focus:outline-none focus:ring-2 focus:ring-[#FFF4CC] focus:border-[#FFDF80] transition cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

/* ───────────────────────────── Area card ──────────────────────────── */
function AreaCard({ area }: { area: any }) {
  const cover = buildImageUrl(area.banner_image);
  const initial = (area.name || 'A').charAt(0).toUpperCase();
  const cats: any[] = (area.top_categories || []).slice(0, 3);

  return (
    <Link
      href={`/areas/${area.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Banner */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#062B49] to-[#144272]">
        {cover ? (
          <img
            src={cover}
            alt={area.name}
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-6xl font-extrabold text-white/15 select-none">{initial}</span>
            <svg className="absolute bottom-3 right-3 w-10 h-10 text-white/10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#062B49]/70 via-transparent to-transparent pointer-events-none" />

        {/* Business count badge */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-bold text-[#062B49]">
          <svg className="w-3.5 h-3.5 text-[#D89E00]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          {formatCount(area.businesses_count || 0)}
        </span>

        <h3 className="absolute bottom-3 left-4 right-4 font-heading text-lg font-bold text-white truncate drop-shadow-sm">
          {area.name}
        </h3>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {area.description && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">{area.description}</p>
        )}

        {cats.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {cats.map((c) => {
              const pair = pickCategoryColorPair(c.name || c.icon);
              return (
                <span
                  key={c.name}
                  className={`inline-flex items-center gap-1 ${pair.bg} border border-transparent rounded-full px-2 py-0.5 text-[11px] font-medium ${pair.text} max-w-full`}
                >
                  <CategoryIcon icon={c.icon} className="w-3 h-3 flex-shrink-0" />
                  <span className="line-clamp-1">{c.name}</span>
                </span>
              );
            })}
          </div>
        )}

        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[#B58200] group-hover:gap-2.5 transition-all">
          Explore Area
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

/* ─────────────────────────── Areas grid ───────────────────────────── */
function AreasGrid({
  areas,
  loading,
  search,
  onClearSearch,
}: {
  areas: any[];
  loading: boolean;
  search: string;
  onClearSearch: () => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  // No areas at all
  if (areas.length === 0 && !search.trim()) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center">
        <span className="w-16 h-16 rounded-full bg-[#FFF9E5] flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#F4B400]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
        <h3 className="font-heading text-lg font-bold text-[#062B49]">No areas yet</h3>
        <p className="text-sm text-gray-500 mt-1">Area guides will appear here once set up.</p>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-[#062B49] text-white text-sm font-semibold hover:bg-[#144272] transition-colors"
        >
          Browse Categories
        </Link>
      </div>
    );
  }

  // No search results
  if (areas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center">
        <span className="w-16 h-16 rounded-full bg-[#FFF9E5] flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#F4B400]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2 6a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <h3 className="font-heading text-lg font-bold text-[#062B49]">
          No areas match &ldquo;{search.trim()}&rdquo;
        </h3>
        <p className="text-sm text-gray-500 mt-1">Try a different locality name.</p>
        <button
          type="button"
          onClick={onClearSearch}
          className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-[#062B49] text-white text-sm font-semibold hover:bg-[#144272] transition-colors"
        >
          Clear Search
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500 mb-4">
        Showing <span className="font-semibold text-[#062B49]">{areas.length}</span>{' '}
        {search.trim() ? 'matching area' : 'areas'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {areas.map((area) => (
          <AreaCard key={area.id} area={area} />
        ))}
      </div>
    </>
  );
}

/* ─────────────────────── Explore more (CTA band) ──────────────────── */
function ExploreMoreSection() {
  return (
    <section className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#062B49] to-[#144272] px-6 sm:px-10 py-10 lg:py-14 overflow-hidden text-center">
          {/* Soft glow accents */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#F4B400]/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#F4B400]/10 blur-3xl pointer-events-none" />

          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Own a Business in Patna?
            </h2>
            <p className="text-gray-300 mt-3">
              Get discovered by customers searching in your area. List your business free and
              appear in local area guides across the city.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard/add-business"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F4B400] text-[#062B49] text-sm font-bold hover:bg-[#FFDF80] transition-colors"
              >
                List Your Business
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
