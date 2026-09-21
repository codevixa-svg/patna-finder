'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, API_BASE_URL } from '@/lib/api';
import { pickCategoryColorPair } from '@/lib/categoryColors';
import TrendingBusinessCard from '@/components/TrendingBusinessCard';
import CategoryIcon from '@/components/CategoryIcon';
import Breadcrumbs from '@/components/Breadcrumbs';

const SORT_OPTIONS = [
  { value: 'most_popular', label: 'Most Popular' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'most_reviewed', label: 'Most Reviewed' },
  { value: 'newest', label: 'Newest First' },
];

const PER_PAGE_OPTIONS = [12, 24, 36];

// 1234 → "1.2k"
const formatCount = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

// Pagination page list with ellipsis, e.g. [1, 2, 3, '…', 12]
function getPagination(current: number, last: number): (number | '…')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(last - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < last - 1) pages.push('…');
  pages.push(last);
  return pages;
}

export default function AreaDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [area, setArea] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, categories: 0, avg_rating: 0 });
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [landmark, setLandmark] = useState<string | null>(null);
  const [pincode, setPincode] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('most_popular');
  const [perPage, setPerPage] = useState(12);
  const [notFound, setNotFound] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(
    async (p: number, s: string, pp: number, scroll = false) => {
      try {
        setLoading(true);
        const data = await api.getAreaBusinesses(slug, { page: p, per_page: pp, sort: s });
        setArea(data.area || null);
        setBusinesses(data.businesses?.data || []);
        setLastPage(data.businesses?.last_page || 1);
        setTotal(data.businesses?.total || 0);
        setPage(data.businesses?.current_page || p);
        if (data.stats) setStats(data.stats);
        setTopCategories(data.top_categories || []);
        setLandmark(data.landmark || null);
        setPincode(data.pincode || null);
        setNotFound(false);
        if (scroll) {
          requestAnimationFrame(() =>
            gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          );
        }
      } catch {
        setBusinesses([]);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    fetchData(1, sort, perPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, fetchData]);
  const handleSortChange = (value: string) => {
    setSort(value);
    fetchData(1, value, perPage, true);
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    fetchData(1, sort, value, true);
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > lastPage || p === page) return;
    fetchData(p, sort, perPage, true);
  };

  const areaName = area?.name || slug;
  const bannerImage = area?.banner_image
    ? /^https?:\/\//i.test(area.banner_image)
      ? area.banner_image
      : `${API_BASE_URL}${area.banner_image.startsWith('/') ? '' : '/'}${area.banner_image}`
    : null;

  const mapQuery =
    area?.latitude && area?.longitude
      ? `${area.latitude},${area.longitude}`
      : `${areaName}, Patna, Bihar`;

  const popularFor = topCategories.slice(0, 3).map((c) => c.name).join(', ');

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <Breadcrumbs items={[{ label: 'Areas', href: '/areas' }, { label: areaName }]} />
      <HeroSection
        areaName={areaName}
        area={area}
        bannerImage={bannerImage}
        stats={stats}
        loading={loading}
        mapQuery={mapQuery}
      />
      <CategoryStrip categories={topCategories} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-8 items-start">
          {/* Sidebar — below the listing on mobile, left column on desktop */}
          <aside className="order-2 lg:order-1 space-y-6 lg:sticky lg:top-24">
            <AboutCard
              areaName={areaName}
              area={area}
              loading={loading}
              landmark={landmark}
              pincode={pincode}
              popularFor={popularFor}
              mapQuery={mapQuery}
            />
            <TopCategoriesCard categories={topCategories} areaName={areaName} loading={loading} />
          </aside>

          {/* Businesses listing */}
          <div ref={gridRef} className="order-1 lg:order-2 scroll-mt-24">
            <ListingHeader areaName={areaName} sort={sort} onSortChange={handleSortChange} />
            <BusinessGrid
              businesses={businesses}
              loading={loading}
              page={page}
              lastPage={lastPage}
              total={total}
              perPage={perPage}
              areaName={areaName}
              notFound={notFound}
              onPageChange={goToPage}
              onPerPageChange={handlePerPageChange}
            />
          </div>
        </div>
      </section>
      <ExploreMoreSection areaName={areaName} mapQuery={mapQuery} />
    </main>
  );
}
/* ───────────────────────────── Hero ───────────────────────────── */
function HeroSection({
  areaName,
  area,
  bannerImage,
  stats,
  loading,
  mapQuery,
}: {
  areaName: string;
  area: any;
  bannerImage: string | null;
  stats: { total: number; categories: number; avg_rating: number };
  loading: boolean;
  mapQuery: string;
}) {
  const statItems = [
    {
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      value: stats.total > 0 ? `${formatCount(stats.total)}+` : '0',
      label: 'Businesses Listed',
    },
    {
      icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z',
      value: stats.categories > 0 ? `${stats.categories}+` : '0',
      label: 'Categories',
    },
    {
      icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      value: stats.avg_rating > 0 ? stats.avg_rating.toFixed(1) : 'New',
      label: 'Average Rating',
    },
  ];

  return (
    <section className="bg-[#FFFBEB] border-b border-[#FFF4CC]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: text */}
          <div>
            <span className="inline-flex items-center gap-2 bg-white shadow-sm border border-[#FFF4CC] rounded-full px-4 py-1.5 text-sm font-semibold text-[#062B49]">
              <svg className="w-4 h-4 text-[#D89E00]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Area Guide
            </span>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#062B49] mt-4 leading-tight">
              {loading ? (
                <span className="inline-block w-72 max-w-full h-10 bg-[#FFF4CC]/80 rounded-xl animate-pulse" />
              ) : (
                <>
                  {areaName}, <span className="text-[#D89E00]">Patna</span>
                </>
              )}
            </h1>

            <p className="mt-4 text-gray-600 leading-relaxed max-w-xl">
              {area?.description
                ? area.description
                : `Explore the best businesses, services and places in ${areaName}. From shopping and food to education and healthcare, discover everything this vibrant Patna locality has to offer.`}
            </p>

            {/* Stats */}
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

          {/* Right: banner image */}
          <div className="relative h-64 sm:h-80 lg:h-[340px] rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br from-[#062B49] to-[#144272]">
            {bannerImage ? (
              <img
                src={bannerImage}
                alt={`${areaName}, Patna`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-28 h-28 text-white/15" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" />
                </svg>
              </div>
            )}

            {/* Script overlay — Shop · Eat · Explore */}
            <div className="absolute top-5 right-5 text-right select-none pointer-events-none">
              <p
                className="text-white text-2xl sm:text-3xl leading-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)] -rotate-3"
                style={{ fontFamily: "'Segoe Script', 'Lucida Handwriting', 'Brush Script MT', cursive" }}
              >
                Shop<br />Eat<br />Explore
              </p>
            </div>

            {/* Location chip */}
            <a
              href={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 bg-[#062B49]/90 backdrop-blur text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg hover:bg-[#062B49] transition-colors"
            >
              <svg className="w-4 h-4 text-[#F4B400]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {areaName}, Patna
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
/* ─────────────────── Category quick-chips strip ─────────────────── */
function CategoryStrip({ categories }: { categories: any[] }) {
  if (!categories.length) return null;
  const chips = categories.slice(0, 6);

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 lg:flex-wrap">
          {chips.map((cat) => {
            const pair = pickCategoryColorPair(cat.name || cat.icon);
            return (
              <Link
                key={cat.id ?? cat.slug}
                href={`/categories/${cat.slug}`}
                className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 flex-shrink-0 transition-colors group"
              >
                <span className={`w-9 h-9 rounded-full flex items-center justify-center ${pair.bg}`}>
                  <CategoryIcon icon={cat.icon} className={`w-4.5 h-4.5 w-[18px] h-[18px] ${pair.text}`} />
                </span>
                <span className="text-sm font-semibold text-[#062B49] whitespace-nowrap">{cat.name}</span>
              </Link>
            );
          })}
          <Link
            href="/categories"
            className="flex items-center gap-2.5 bg-gray-50 hover:bg-[#FFF9E5] border border-gray-100 hover:border-[#FFF4CC] rounded-xl px-4 py-2.5 flex-shrink-0 transition-colors"
          >
            <span className="w-9 h-9 rounded-full flex items-center justify-center bg-[#062B49] text-[#F4B400]">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-[#062B49] whitespace-nowrap">More Categories</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
/* ───────────────────────────── About card ─────────────────────────── */
function AboutCard({
  areaName,
  area,
  loading,
  landmark,
  pincode,
  popularFor,
  mapQuery,
}: {
  areaName: string;
  area: any;
  loading: boolean;
  landmark: string | null;
  pincode: string | null;
  popularFor: string;
  mapQuery: string;
}) {
  const infoRows = [
    {
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
      label: 'Nearest Landmark',
      value: landmark,
    },
    {
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      label: 'Pincode',
      value: pincode,
    },
    {
      icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      label: 'Popular For',
      value: popularFor || null,
    },
  ].filter((row) => row.value);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#D89E00] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="font-heading text-base font-bold text-[#062B49]">About {areaName}</h2>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          {loading ? (
            <span className="block space-y-1.5">
              <span className="block w-full h-3 bg-gray-100 rounded animate-pulse" />
              <span className="block w-4/5 h-3 bg-gray-100 rounded animate-pulse" />
            </span>
          ) : (
            area?.description ||
            `${areaName} is one of Patna's well-known localities. Browse trusted local businesses — from shops and eateries to clinics, schools and everyday services — all in one place.`
          )}
        </p>

        {infoRows.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-start gap-2.5 text-sm">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={row.icon} />
                </svg>
                <span className="text-gray-500 flex-shrink-0">{row.label}:</span>
                <span className="font-medium text-[#062B49] line-clamp-1">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        <a
          href={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B58200] hover:text-[#8A6400] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          View on Google Maps
        </a>
      </div>
    </div>
  );
}

/* ──────────────────────── Top categories card ─────────────────────── */
function TopCategoriesCard({
  categories,
  areaName,
  loading,
}: {
  categories: any[];
  areaName: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#D89E00] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
        </svg>
        <h2 className="font-heading text-base font-bold text-[#062B49]">Top Categories in {areaName}</h2>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="space-y-2 p-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full h-10 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500 px-2 py-1.5">No categories to show yet.</p>
        ) : (
          <div className="space-y-1">
            {categories.map((cat) => (
              <Link
                key={cat.id ?? cat.slug}
                href={`/categories/${cat.slug}`}
                className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-[#FFF9E5] transition-colors group"
              >
                <span className={`w-9 h-9 rounded-full ${pickCategoryColorPair(cat.name || cat.icon).bg} flex items-center justify-center flex-shrink-0`}>
                  <CategoryIcon icon={cat.icon} className={`w-[18px] h-[18px] ${pickCategoryColorPair(cat.name || cat.icon).text}`} />
                </span>
                <span className="flex-1 text-sm font-semibold text-[#062B49] line-clamp-1">{cat.name}</span>
                {typeof cat.businesses_count !== 'undefined' && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-50 rounded-full px-2 py-0.5 flex-shrink-0">
                    {cat.businesses_count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/categories"
        className="flex items-center justify-center gap-1.5 px-5 py-3.5 border-t border-gray-100 text-sm font-semibold text-[#B58200] hover:bg-[#FFF9E5] transition-colors"
      >
        View All Categories
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
    </div>
  );
}

/* ───────────────────────── Listing header ─────────────────────────── */
function ListingHeader({
  areaName,
  sort,
  onSortChange,
}: {
  areaName: string;
  sort: string;
  onSortChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#062B49]">
          Businesses in <span className="text-[#D89E00]">{areaName}</span>
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">Trusted local places, updated regularly</p>
      </div>
      <label className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm text-gray-500">Sort by</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-[#062B49] focus:outline-none focus:ring-2 focus:ring-[#FFF4CC] focus:border-[#FFDF80] transition cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

/* ───────────────────────── Businesses grid ────────────────────────── */
function BusinessGrid({
  businesses,
  loading,
  page,
  lastPage,
  total,
  perPage,
  areaName,
  notFound,
  onPageChange,
  onPerPageChange,
}: {
  businesses: any[];
  loading: boolean;
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
  areaName: string;
  notFound: boolean;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  if (notFound || businesses.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center">
        <span className="w-16 h-16 rounded-full bg-[#FFF9E5] flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#F4B400]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </span>
        <h3 className="font-heading text-lg font-bold text-[#062B49]">No businesses found in {areaName}</h3>
        <p className="text-sm text-gray-500 mt-1">New listings are added regularly — check back soon.</p>
        <Link
          href="/areas"
          className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-[#062B49] text-white text-sm font-semibold hover:bg-[#144272] transition-colors"
        >
          Browse Other Areas
        </Link>
      </div>
    );
  }

  const pages = getPagination(page, lastPage);
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {businesses.map((b) => (
          <TrendingBusinessCard key={b.id} business={b} />
        ))}
      </div>

      {/* Footer: result count, per-page selector & pagination */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-[#062B49]">{from}–{to}</span> of{' '}
          <span className="font-semibold text-[#062B49]">{formatCount(total)}</span> businesses
        </p>

        <label className="flex items-center gap-2 text-sm text-gray-500">
          Per page
          <select
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-[#062B49] focus:outline-none focus:ring-2 focus:ring-[#FFF4CC] transition cursor-pointer"
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      {lastPage > 1 && (
        <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-[#B58200] hover:border-[#FFF4CC] disabled:opacity-40 disabled:pointer-events-none transition flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                disabled={p === page}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
                  p === page
                    ? 'bg-[#062B49] text-white'
                    : 'border border-gray-200 bg-white text-gray-600 hover:text-[#B58200] hover:border-[#FFF4CC]'
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === lastPage}
            aria-label="Next page"
            className="w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-[#B58200] hover:border-[#FFF4CC] disabled:opacity-40 disabled:pointer-events-none transition flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </nav>
      )}
    </>
  );
}

/* ─────────────────────── Explore more (CTA band) ──────────────────── */
function ExploreMoreSection({ areaName, mapQuery }: { areaName: string; mapQuery: string }) {
  return (
    <section className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#062B49] to-[#144272] px-6 sm:px-10 py-10 lg:py-14 overflow-hidden">
          {/* Soft glow accents */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#F4B400]/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#F4B400]/10 blur-3xl pointer-events-none" />

          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">Keep Exploring Patna</h2>
            <p className="text-gray-300 mt-3">
              Discover more area guides, browse businesses by category or find hidden gems near {areaName}.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/areas"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F4B400] text-[#062B49] text-sm font-bold hover:bg-[#FFDF80] transition-colors"
              >
                All Areas
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                Browse Categories
              </Link>
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4 text-[#F4B400]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Open in Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
