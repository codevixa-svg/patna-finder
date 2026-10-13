'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Building2,
  MapPin,
  MoreHorizontal,
  Search,
  Star,
  Users,
} from 'lucide-react';
import CategoryIcon from './CategoryIcon';

/* ───────────────────────── Types & static data ───────────────────────── */

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  /** Real listing count from the API (`Category::withCount('businesses')`). */
  businesses_count?: number;
}

// Featured-card color pairs, cycled across the dynamic featured grid so the
// approved design's pastel variety survives without per-card hardcoding.
const FEATURED_COLORS = [
  { bg: 'bg-sky-100', text: 'text-sky-600' },
  { bg: 'bg-orange-100', text: 'text-orange-600' },
  { bg: 'bg-[#FFF4CC]', text: 'text-[#B58200]' },
  { bg: 'bg-blue-100', text: 'text-blue-600' },
  { bg: 'bg-rose-100', text: 'text-rose-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
  { bg: 'bg-pink-100', text: 'text-pink-600' },
  { bg: 'bg-teal-100', text: 'text-teal-600' },
  { bg: 'bg-violet-100', text: 'text-violet-600' },
  { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  { bg: 'bg-green-100', text: 'text-green-600' },
  { bg: 'bg-red-100', text: 'text-red-600' },
  { bg: 'bg-purple-100', text: 'text-purple-600' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-600' },
];

// How many dynamic categories the featured "Browse Categories" grid shows
// before the "More Categories" card. +1 card = 15 (3 full rows at 5 cols).
const FEATURED_LIMIT = 14;

const HERO_FEATURES = [
  { icon: MapPin, title: 'Local Businesses', desc: 'Discover trusted businesses in your city' },
  { icon: Users, title: 'Verified Listings', desc: 'Find genuine and reliable service providers' },
  { icon: Star, title: 'Support Local', desc: 'Help Patna grow stronger together' },
];

const SITE_STATS = [
  { icon: Building2, value: '25K+', label: 'Local Businesses' },
  { icon: Users, value: '50K+', label: 'Monthly Visitors' },
  { icon: Star, value: '100+', label: 'Categories' },
  { icon: MapPin, value: '1', label: 'Amazing City' },
];

const TILE_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-[#FFF4CC] text-[#062B49]',
  'bg-orange-100 text-orange-700',
  'bg-red-100 text-red-700',
  'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
  'bg-pink-100 text-pink-700',
  'bg-cyan-100 text-cyan-700',
];

const PAGE_SIZE = 48;


/**
 * Full categories page body: hero, dynamic "Browse Categories" grid (first
 * slice of the API list, cards without photos per the approved design), the
 * searchable full GMB list (4k+ items, progressive rendering) and the
 * golden-skyline stats band. The hero search and the list search share one
 * query, so typing in either place filters the same grid below.
 */
export default function CategoriesBrowser({
  categories,
}: {
  categories: CategoryItem[];
}) {
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const allListRef = useRef<HTMLElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, query]);

  const visible = filtered.slice(0, visibleCount);

  // Featured "Browse Categories" grid — first slice of the dynamic API list.
  // The endpoint sorts by display_order, so admin-curated categories lead,
  // followed by the seeded GMB long tail.
  const featured = categories.slice(0, FEATURED_LIMIT);

  const updateQuery = (value: string) => {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
  };

  const scrollToAll = () => {
    allListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section
        className="relative min-h-[440px] bg-cover bg-center"
        style={{ backgroundImage: "url('/images/events-hero.png')" }}
      >
        {/* Navy overlay keeps the text readable over the skyline */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#062B49]/95 via-[#062B49]/80 to-[#062B49]/55" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Left — title + search */}
            <div className="text-white">
              <h1 className="mb-5 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                All <span className="text-[#F4B400]">Categories</span>
              </h1>
              <p className="mb-8 text-lg text-gray-200 sm:text-xl">
                Explore the best businesses, services and places
                <br className="hidden sm:block" /> in Patna — all in one place.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  scrollToAll();
                }}
                className="flex max-w-2xl items-stretch overflow-hidden rounded-xl bg-white shadow-2xl"
              >
                <span className="flex items-center pl-5 pr-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => updateQuery(e.target.value)}
                  placeholder="Search categories (e.g. doctors, restaurants, salons...)"
                  className="min-w-0 flex-1 py-4 text-gray-900 placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#F4B400] px-6 font-bold text-[#062B49] transition hover:bg-[#FFD35A] sm:px-8"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right — script accent + brush panel (desktop) */}
            <div className="relative hidden lg:block">
              <p className="absolute -top-3 right-3 z-10 -rotate-3 font-script text-3xl leading-tight text-[#F4B400]">
                Same City,
                <br />
                More Possibilities <span aria-hidden="true">♥</span>
              </p>
              <div className="mt-20 space-y-5 rounded-[110px_48px_120px_56px/64px_120px_56px_110px] bg-black/85 p-7">
                {HERO_FEATURES.map((f) => (
                  <div key={f.title} className="flex items-start gap-3.5">
                    <f.icon className="mt-0.5 h-6 w-6 shrink-0 text-[#F4B400]" />
                    <div>
                      <p className="font-bold leading-snug text-white">{f.title}</p>
                      <p className="mt-0.5 text-sm leading-snug text-gray-300">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ DYNAMIC FEATURED CATEGORY CARDS ═══════════════════ */}
      {featured.length > 0 && (
      <section className="relative z-10 -mt-6 rounded-tl-[40px] bg-white sm:-mt-10 sm:rounded-tl-[64px]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-extrabold sm:text-3xl">
                <span className="text-[#062B49]">Browse</span>{' '}
                <span className="text-[#F4B400]">Categories</span>
              </h2>
              <p className="mt-1.5 text-sm text-gray-500 sm:text-base">
                Find what you need from a wide range of categories in Patna.
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToAll}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
            >
              View All Categories
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Dynamic cards — first slice of the API list; icon + name +
              real listing count + arrow, no photos. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {featured.map((category, index) => {
              const color = FEATURED_COLORS[index % FEATURED_COLORS.length];
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative flex items-start gap-3.5 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-[#FFFBEE] p-4 shadow-[0_2px_10px_rgba(6,43,73,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#F4B400]/60 hover:shadow-[0_10px_24px_rgba(6,43,73,0.10)] sm:p-5"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color.bg}`}
                  >
                    <CategoryIcon icon={category.icon} className={`h-5 w-5 ${color.text}`} />
                  </span>
                  <span className="min-w-0 flex-1 pr-7">
                    <span className="block text-[15px] font-bold leading-tight text-[#062B49] transition group-hover:text-[#B58200]">
                      {category.name}
                    </span>
                    <span className="mt-1.5 block truncate text-xs text-gray-500">
                      {category.businesses_count
                        ? `${category.businesses_count} Listing${category.businesses_count === 1 ? '' : 's'}`
                        : category.description || 'Browse listings'}
                    </span>
                  </span>
                  <span className="absolute bottom-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#062B49] shadow-md transition group-hover:bg-[#F4B400]">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}

            {/* "More Categories" card — jumps to the full list */}
            <button
              type="button"
              onClick={scrollToAll}
              className="group relative flex items-start gap-3.5 rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-[#FFFBEE] p-4 text-left shadow-[0_2px_10px_rgba(6,43,73,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#F4B400]/60 hover:shadow-[0_10px_24px_rgba(6,43,73,0.10)] sm:p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[#062B49]">
                <MoreHorizontal className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 pr-7">
                <span className="block text-[15px] font-bold leading-tight text-[#062B49] transition group-hover:text-[#B58200]">
                  More Categories
                </span>
                <span className="mt-1.5 block text-xs text-gray-500">Explore All</span>
              </span>
              <span className="absolute bottom-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#062B49] shadow-md transition group-hover:bg-[#F4B400]">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </section>
      )}

      {/* ═══════════════════ FULL, SEARCHABLE CATEGORY LIST ═══════════════════ */}
      <section ref={allListRef} className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="font-heading text-2xl font-extrabold text-[#062B49] sm:text-3xl">
              All <span className="text-[#D89E00]">Categories</span>
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Search the complete list of {categories.length} categories on Khojya
            </p>
          </div>

          {/* Search — shares state with the hero search */}
          <div className="relative mx-auto mb-10 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
              placeholder={`Search ${categories.length} categories...`}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-300 bg-white shadow-sm outline-none focus:ring-2 focus:ring-[#D89E00] focus:border-[#D89E00] text-gray-900"
            />
          </div>

          {/* Full, searchable GMB list — shared query with the hero search */}
          {visible.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-gray-500">
                No categories found for &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visible.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 text-center transition-all hover:border-[#F4B400] hover:shadow-md"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${TILE_COLORS[index % TILE_COLORS.length]}`}
                  >
                    <CategoryIcon icon={category.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold leading-snug text-gray-900 transition group-hover:text-[#B58200]">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}

          {/* Load more */}
          {filtered.length > visibleCount && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-xl bg-[#062B49] px-8 py-3 font-semibold text-white transition hover:bg-[#0f2c5c]"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ GOLDEN SKYLINE STATS BAND ═══════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FDF1E4] via-[#FBE7D3] to-[#F8DCC2]">
        {/* Patna heritage skyline illustration along the bottom */}
        <Image
          src="/images/footer-png.png"
          alt=""
          width={2167}
          height={726}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 w-full select-none object-contain object-bottom"
        />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-14 sm:px-6 lg:flex-row lg:justify-between lg:px-8">
          {/* Left — brush script */}
          <p className="hidden shrink-0 -rotate-3 bg-black px-7 py-4 font-script text-3xl leading-tight text-[#F4B400] shadow-lg lg:block">
            Patna
            <br />
            Ek Shehar, Anek Kahanisian ♥
          </p>

          {/* Centre — stats */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 text-center sm:grid-cols-4 sm:gap-x-14">
            {SITE_STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1.5">
                <s.icon className="h-8 w-8 text-[#D89E00]" />
                <span className="font-heading text-2xl font-extrabold text-[#062B49] sm:text-3xl">
                  {s.value}
                </span>
                <span className="text-sm font-medium text-gray-600">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Right — script accent */}
          <p className="hidden shrink-0 -rotate-6 text-right font-script text-3xl leading-tight text-[#062B49] lg:block">
            Proudly
            <br />
            Patna
            <br />
            Always ♥
          </p>
        </div>
      </section>
    </>
  );
}