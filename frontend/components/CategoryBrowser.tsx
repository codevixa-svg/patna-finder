'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { api } from '@/lib/api';
import ExploreBusinessCard from '@/components/ExploreBusinessCard';
import CategoryIcon from '@/components/CategoryIcon';

const PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'review_count', label: 'Most Reviewed' },
  { value: 'newest', label: 'Newest First' },
];

const RATING_OPTIONS = [
  { value: '4.5', label: '4.5★ & above' },
  { value: '4', label: '4★ & above' },
  { value: '3.5', label: '3.5★ & above' },
  { value: '3', label: '3★ & above' },
];

// Laravel paginator ({ data, current_page, ... }) or a plain array.
const asList = (res: any): any[] => (Array.isArray(res) ? res : res?.data || []);

/** Numbered pagination: first two, current ±1, last two, gaps as "…". */
function getPageList(current: number, last: number): (number | '…')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const wanted = [1, 2, current - 1, current, current + 1, last - 1, last].filter(
    (p) => p >= 1 && p <= last,
  );
  const unique = Array.from(new Set(wanted)).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  unique.forEach((p, i) => {
    if (i > 0 && p - unique[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

const PinIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StarIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ChevronIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
  </svg>
);

/** Patna skyline line-art hero artwork (Golghar inspired). */
function SkylineArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 260" fill="none" aria-hidden="true" className={className}>
      <circle cx="560" cy="60" r="26" stroke="#F4B400" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="560" cy="60" r="40" stroke="#F4B400" strokeOpacity="0.15" strokeWidth="1" />
      <path d="M470 200c0-45 25-75 55-75s55 30 55 75" stroke="white" strokeOpacity="0.25" strokeWidth="1.6" />
      <path d="M480 200c0-38 20-63 45-63s45 25 45 63M490 200c0-30 15-50 35-50s35 20 35 50" stroke="white" strokeOpacity="0.16" strokeWidth="1.2" />
      <path d="M525 125v-10" stroke="#F4B400" strokeOpacity="0.5" strokeWidth="2" />
      <path d="M60 200v-60h50v60M110 200v-90h44v90M154 200v-46h40v46M300 200v-70h56v70M356 200v-100h48v100" stroke="white" strokeOpacity="0.18" strokeWidth="1.4" />
      <path d="M72 152h26M72 168h26M122 122h20M122 140h20M122 158h20M312 142h32M312 160h32M368 112h24M368 130h24M368 148h24" stroke="white" strokeOpacity="0.14" strokeWidth="1.2" />
      <path d="M0 200h640" stroke="white" strokeOpacity="0.2" strokeWidth="1.4" />
    </svg>
  );
}

/* ── Dropdown ───────────────────────────────────────────────────────────── */

function FilterDropdown({
  label,
  allLabel,
  value,
  onChange,
  options,
  icon,
  align = 'left',
}: {
  label: string;
  allLabel: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  icon?: ReactNode;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selected = options.find((o) => o.value === value);
  const display = selected?.label || label;
  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setQuery('');
        }}
        className={`inline-flex min-w-[150px] items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
          selected
            ? 'border-[#F4B400] bg-[#FFF9E5] text-[#062B49]'
            : 'border-gray-200 bg-white text-[#062B49] hover:border-[#FFDF80] hover:bg-[#FFF9E5]'
        }`}
      >
        {icon}
        <span className="min-w-0 flex-1 truncate text-left">{display}</span>
        <ChevronIcon className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className={`absolute z-40 mt-2 w-60 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl shadow-[#062B49]/15 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="border-b border-gray-100 p-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-lg bg-gray-50 px-3 py-2 text-sm text-[#062B49] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F4B400]/40"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className={`block w-full px-3.5 py-2 text-left text-sm transition-colors ${
                !value ? 'bg-[#FFF9E5] font-bold text-[#062B49]' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {allLabel}
            </button>
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`block w-full px-3.5 py-2 text-left text-sm transition-colors ${
                  value === o.value ? 'bg-[#FFF9E5] font-bold text-[#062B49]' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {o.label}
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3.5 py-3 text-xs text-gray-400">No matches</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-gray-100 px-1 py-4 first:border-t-0">
      <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-gray-400">{title}</p>
      <div className="max-h-52 space-y-0.5 overflow-y-auto scrollbar-hide">{children}</div>
    </div>
  );
}

function FilterCheckRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number | null;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
        active ? 'bg-[#FFF9E5] font-semibold text-[#062B49]' : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition-colors ${
          active ? 'border-[#F4B400] bg-[#F4B400]' : 'border-gray-300 bg-white'
        }`}
      >
        {active && (
          <svg className="h-3 w-3 text-[#062B49]" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof count === 'number' && <span className="shrink-0 text-xs text-gray-400">({count})</span>}
    </button>
  );
}

function PaginationNav({
  current,
  last,
  onPage,
}: {
  current: number;
  last: number;
  onPage: (p: number) => void;
}) {
  if (last <= 1) return null;
  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onPage(current - 1)}
        disabled={current <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#F4B400] hover:text-[#062B49] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous page"
      >
        <svg className="h-4 w-4 rotate-90" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>
      {getPageList(current, last).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1.5 text-sm text-gray-400">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-current={p === current ? 'page' : undefined}
            className={`h-9 min-w-9 rounded-lg px-2.5 text-sm font-semibold transition ${
              p === current
                ? 'bg-[#062B49] text-white'
                : 'border border-gray-200 text-gray-600 hover:border-[#F4B400] hover:text-[#062B49]'
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPage(current + 1)}
        disabled={current >= last}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-[#F4B400] hover:text-[#062B49] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <svg className="h-4 w-4 -rotate-90" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>
    </nav>
  );
}

/* ── Right-rail promo cards ─────────────────────────────────────────────── */

function RightRail({ categoryName }: { categoryName: string }) {
  return (
    <aside className="hidden w-[280px] shrink-0 space-y-5 xl:block">
      <div className="rounded-2xl border border-[#FFF4CC] bg-[#FFFBEB] p-6 text-center">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <svg className="h-6 w-6 text-[#D89E00]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </span>
        <h3 className="font-heading text-base font-extrabold text-[#062B49]">Need Help?</h3>
        <p className="mt-1.5 text-xs text-gray-500">
          Book an appointment with top {categoryName.toLowerCase()} in Patna.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-block w-full rounded-xl bg-[#F4B400] py-2.5 text-sm font-bold text-[#062B49] transition-colors hover:bg-[#FFDF80]"
        >
          Book Appointment →
        </Link>
      </div>

      <div className="rounded-2xl bg-[#062B49] p-6 text-white">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F4B400]">
          <svg className="h-5 w-5 text-[#062B49]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 1l6 2v5c0 4.5-2.5 8.5-6 10-3.5-1.5-6-5.5-6-10V3l6-2zm3.857 7.191a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" />
          </svg>
        </span>
        <h3 className="text-center font-heading text-base font-extrabold">Verified &amp; Trusted</h3>
        <p className="mt-1.5 text-center text-xs leading-relaxed text-gray-300">
          All listings are verified and regularly updated for your safety.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-[#FFF9E5] p-6">
        <span className="font-heading text-4xl leading-none text-[#F4B400]" aria-hidden="true">“</span>
        <p className="mt-1 font-heading text-sm font-semibold leading-relaxed text-[#062B49]">
          Discovering local Patna is the first step towards a stronger community.
        </p>
        <p className="mt-3 text-xs font-semibold text-[#D89E00]">— Patna Finder</p>
      </div>
    </aside>
  );
}

/* ── Main browser ───────────────────────────────────────────────────────── */

interface CategoryBrowserProps {
  slug: string;
  categoryName: string;
  categoryIcon?: string | null;
  heroStats: { total: number; avgRating: number; reviewCount: number };
  areaCounts: { id: number; name: string; businesses_count: number }[];
  topCategories: { id: number; name: string; slug: string; icon?: string; businesses_count: number }[];
}

export default function CategoryBrowser({
  slug,
  categoryName,
  categoryIcon,
  heroStats,
  areaCounts,
  topCategories,
}: CategoryBrowserProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [areaId, setAreaId] = useState('');
  const [minRating, setMinRating] = useState('');
  const [sort, setSort] = useState('recommended');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showAllAreas, setShowAllAreas] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: heroStats.total });
  const [loading, setLoading] = useState(true);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when any filter changes
  const currentQueryKey = [debouncedSearch, areaId, minRating, sort].join('|');
  const [paging, setPaging] = useState({ key: currentQueryKey, page: 1 });
  if (paging.key !== currentQueryKey) setPaging({ key: currentQueryKey, page: 1 });

  useEffect(() => {
    let cancelled = false;
    const requestPage = paging.page;

    const load = async () => {
      setLoading(true);
      const params: Record<string, any> = {
        page: requestPage,
        per_page: PER_PAGE,
        sort,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (areaId) params.area_id = areaId;
      if (minRating) params.min_rating = minRating;

      try {
        const res: any = await api.getCategoryBusinesses(slug, params);
        const list = asList(res?.businesses);
        if (cancelled) return;
        setItems(list);
        setMeta({
          current_page: res?.businesses?.current_page ?? 1,
          last_page: res?.businesses?.last_page ?? 1,
          total: res?.businesses?.total ?? list.length,
        });
        if (requestPage > 1) {
          requestAnimationFrame(() =>
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          );
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          setMeta({ current_page: 1, last_page: 1, total: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, paging.page, paging.key, debouncedSearch, areaId, minRating, sort]);

  const areaOptions = useMemo(
    () => areaCounts.map((a) => ({ value: String(a.id), label: a.name })),
    [areaCounts],
  );

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onClear: () => void }[] = [];
    if (debouncedSearch)
      chips.push({ key: 'search', label: `\u201C${debouncedSearch}\u201D`, onClear: () => setSearch('') });
    if (areaId) {
      const area = areaCounts.find((a) => String(a.id) === areaId);
      chips.push({ key: 'area', label: area?.name || 'Area', onClear: () => setAreaId('') });
    }
    if (minRating) chips.push({ key: 'rating', label: `${minRating}★ & above`, onClear: () => setMinRating('') });
    return chips;
  }, [debouncedSearch, areaCounts, areaId, minRating]);

  const clearAll = () => {
    setSearch('');
    setAreaId('');
    setMinRating('');
  };

  const resultFrom = meta.total === 0 ? 0 : (meta.current_page - 1) * PER_PAGE + 1;
  const resultTo = Math.min(meta.current_page * PER_PAGE, meta.total);

  const goToPage = (page: number) => {
    if (page < 1 || page > meta.last_page || page === meta.current_page) return;
    setPaging({ key: currentQueryKey, page });
  };

  const visibleAreas = showAllAreas ? areaCounts : areaCounts.slice(0, 5);

  const renderFilterPanel = () => (
    <div>
      <div className="flex items-center justify-between px-1 pb-1">
        <p className="font-heading text-sm font-extrabold uppercase tracking-wide text-[#062B49]">Filters</p>
        {activeChips.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-bold text-[#D89E00] transition-colors hover:text-[#062B49]"
          >
            Clear All
          </button>
        )}
      </div>

      <FilterGroup title="Categories">
        <Link
          href="/categories"
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#062B49] transition-colors hover:bg-gray-50"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          All Categories
        </Link>
        {topCategories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            aria-current={c.slug === slug ? 'page' : undefined}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
              c.slug === slug ? 'bg-[#FFF9E5] font-semibold text-[#062B49]' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CategoryIcon icon={c.icon} className="h-4 w-4 shrink-0 text-[#D89E00]" />
            <span className="min-w-0 flex-1 truncate">{c.name}</span>
            <span className="shrink-0 text-xs text-gray-400">({c.businesses_count})</span>
          </Link>
        ))}
      </FilterGroup>

      <FilterGroup title="Areas">
        {areaCounts.length > 0 && (
          <FilterCheckRow
            label="All Areas"
            count={heroStats.total}
            active={!areaId}
            onClick={() => setAreaId('')}
          />
        )}
        {visibleAreas.map((a) => (
          <FilterCheckRow
            key={a.id}
            label={a.name}
            count={a.businesses_count}
            active={areaId === String(a.id)}
            onClick={() => setAreaId(areaId === String(a.id) ? '' : String(a.id))}
          />
        ))}
        {areaCounts.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAllAreas((v) => !v)}
            className="flex items-center gap-1 px-2 py-2 text-xs font-bold text-[#D89E00] transition-colors hover:text-[#062B49]"
          >
            {showAllAreas ? 'Show Less' : `Show More (${areaCounts.length - 5})`}
            <ChevronIcon className={`h-3 w-3 transition-transform ${showAllAreas ? 'rotate-180' : ''}`} />
          </button>
        )}
        {areaCounts.length === 0 && <p className="px-2 py-3 text-xs text-gray-400">No areas yet</p>}
      </FilterGroup>

      <FilterGroup title="Rating">
        {RATING_OPTIONS.map((r) => (
          <FilterCheckRow
            key={r.value}
            label={r.label}
            active={minRating === r.value}
            onClick={() => setMinRating(minRating === r.value ? '' : r.value)}
          />
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#062B49] pt-16 text-white sm:pt-20 md:pt-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#062B49] via-[#083455] to-[#0B4A6F]" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F4B400]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-[#F4B400]/10 blur-3xl" />
        <SkylineArt className="pointer-events-none absolute bottom-0 right-0 hidden w-[420px] select-none opacity-90 sm:block lg:w-[560px]" />

        <div className="relative mx-auto max-w-[1240px] px-4 pb-9 sm:px-6 sm:pb-10 lg:px-8">
          {/* Breadcrumb (hero variant) */}
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex items-center flex-wrap gap-x-1.5 gap-y-1 text-sm">
              <li>
                <Link href="/" className="inline-flex items-center gap-1.5 text-white/70 transition hover:text-[#F4B400]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />
                  </svg>
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-white/40">›</li>
              <li>
                <Link href="/categories" className="text-white/70 transition hover:text-[#F4B400]">Categories</Link>
              </li>
              <li aria-hidden="true" className="text-white/40">›</li>
              <li className="font-semibold text-[#F4B400]">{categoryName}</li>
            </ol>
          </nav>

          <h1 className="mt-3 max-w-3xl font-heading text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            {categoryName} in <span className="text-[#F4B400]">Patna</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-gray-300 sm:text-base">
            Find the best {categoryName.toLowerCase()} and services in Patna — verified listings, real reviews.
          </p>

          {/* Stats row */}
          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400]">
                <CategoryIcon icon={categoryIcon} className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-lg font-extrabold leading-none">{heroStats.total}+</p>
                <p className="mt-0.5 text-xs text-gray-300">Verified Businesses</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0zM15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07" />
                </svg>
              </span>
              <div>
                <p className="font-heading text-lg font-extrabold leading-none">
                  {heroStats.reviewCount >= 1000
                    ? `${(heroStats.reviewCount / 1000).toFixed(1).replace(/\.0$/, '')}+`
                    : `${heroStats.reviewCount}+`}
                </p>
                <p className="mt-0.5 text-xs text-gray-300">Happy Customers</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400]">
                <StarIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-lg font-extrabold leading-none">{heroStats.avgRating || '—'}</p>
                <p className="mt-0.5 text-xs text-gray-300">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Location badge */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold">
            <PinIcon className="h-4 w-4 text-[#F4B400]" />
            Patna, Bihar
          </div>
        </div>
      </section>

      {/* ── Floating search + filter toolbar ─────────────────────────────── */}
      <div className="relative z-30 mx-auto -mt-8 max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-xl shadow-[#062B49]/10 sm:p-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                setDebouncedSearch(search.trim());
              }}
              className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 transition-colors focus-within:border-[#F4B400]"
            >
              <svg className="h-5 w-5 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${categoryName.toLowerCase()}, services…`}
                aria-label={`Search ${categoryName}`}
                className="min-w-0 flex-1 bg-transparent text-sm text-[#062B49] placeholder:text-gray-400 focus:outline-none"
              />
            </form>

            <FilterDropdown
              label="All Areas"
              allLabel="All Areas"
              value={areaId}
              onChange={setAreaId}
              options={areaOptions}
              icon={<PinIcon className="h-4 w-4 text-[#D89E00]" />}
            />

            <FilterDropdown
              label="All Ratings"
              allLabel="All Ratings"
              value={minRating}
              onChange={setMinRating}
              options={RATING_OPTIONS}
              icon={<StarIcon className="h-4 w-4 text-[#D89E00]" />}
            />

            <button
              type="button"
              onClick={() => setDebouncedSearch(search.trim())}
              className="rounded-xl bg-[#F4B400] px-6 py-2.5 text-sm font-bold text-[#062B49] transition-colors hover:bg-[#FFDF80]"
            >
              Search
            </button>

            {/* Mobile: filters drawer */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[#062B49] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#144272] lg:hidden"
            >
              Filters
              {activeChips.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F4B400] px-1 text-[11px] font-bold text-[#062B49]">
                  {activeChips.length}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Filters</span>
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onClear}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#FFF4CC] bg-[#FFF9E5] py-1.5 pl-3 pr-2 text-xs font-semibold text-[#062B49] transition-colors hover:border-[#FFDF80]"
                >
                  {chip.label}
                  <svg className="h-3.5 w-3.5 text-[#D89E00]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────────────────── */}
      <div ref={resultsRef} className="mx-auto max-w-[1240px] scroll-mt-6 px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden w-[250px] shrink-0 lg:block">
            <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              {renderFilterPanel()}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-extrabold text-[#062B49] sm:text-2xl">
                  Top {categoryName} in Patna
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {loading ? (
                    'Loading results…'
                  ) : (
                    <>
                      Showing <span className="font-semibold text-[#062B49]">{resultFrom}–{resultTo}</span> of{' '}
                      <span className="font-semibold text-[#062B49]">{meta.total}</span>{' '}
                      {categoryName.toLowerCase()}
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-semibold uppercase tracking-wide text-gray-400 sm:block">
                  Sort by
                </span>
                <FilterDropdown
                  label="Recommended"
                  allLabel="Recommended"
                  value={sort}
                  onChange={setSort}
                  options={SORT_OPTIONS}
                  align="right"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white">
                    <div className="h-44 bg-gray-200" />
                    <div className="space-y-3 p-4">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3.5 w-1/3 rounded bg-gray-100" />
                      <div className="h-3.5 w-1/2 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((business: any) => (
                    <ExploreBusinessCard key={business.id} business={business} />
                  ))}
                </div>
                <PaginationNav current={meta.current_page} last={meta.last_page} onPage={goToPage} />
              </>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center">
                <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF9E5]">
                  <CategoryIcon icon={categoryIcon} className="h-8 w-8 text-[#F4B400]" />
                </span>
                <h3 className="font-heading text-lg font-bold text-[#062B49]">
                  No {categoryName.toLowerCase()} found
                </h3>
                <p className="mx-auto mt-1.5 max-w-md text-sm text-gray-500">
                  Try a different area or rating, or clear the filters to start over.
                </p>
                {activeChips.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#062B49] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#144272]"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>

          <RightRail categoryName={categoryName} />
        </div>
      </div>

      {/* ── Mobile filters drawer ────────────────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div
            className="absolute inset-0 bg-[#062B49]/60 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
              <h3 className="font-heading text-base font-extrabold text-[#062B49]">Filters</h3>
              <div className="flex items-center gap-3">
                {activeChips.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs font-bold text-[#D89E00] transition-colors hover:text-[#062B49]"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2">{renderFilterPanel()}</div>
            <div className="border-t border-gray-100 p-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-xl bg-[#F4B400] py-3 text-sm font-bold text-[#062B49] transition-colors hover:bg-[#FFDF80]"
              >
                Show {meta.total} {meta.total === 1 ? 'Result' : 'Results'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
