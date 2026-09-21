'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { api } from '@/lib/api';
import ExploreBusinessCard from '@/components/ExploreBusinessCard';
import { EXPLORE_FILTERS, FILTER_LABELS } from '@/lib/explore-filters';

const PER_PAGE = 12;

/**
 * Quick-filter → /businesses query params. The dedicated trending / featured /
 * hidden-gems endpoints return the same rows, so the browser queries the
 * filterable /businesses endpoint instead — that way pagination, search and the
 * category / area / rating filters keep working on every tab.
 */
const FILTER_BASE_PARAMS: Record<string, Record<string, string | number>> = {
  // "all" sends no flag params — the /businesses endpoint returns every
  // approved business, which is exactly what the All tab should show.
  all: {},
  trending: { is_trending: 1 },
  featured: { is_featured: 1 },
  'hidden-gems': { is_hidden_gem: 1 },
  'highest-rated': {},
  'recently-added': {},
};

/** Natural sort order for each quick filter (drives the sort dropdown). */
const FILTER_DEFAULT_SORT: Record<string, string> = {
  all: 'created_at',
  trending: 'popular',
  featured: 'rating',
  'hidden-gems': 'rating',
  'highest-rated': 'rating',
  'recently-added': 'created_at',
};

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'review_count', label: 'Most Reviewed' },
  { value: 'popular', label: 'Most Viewed' },
];

const RATING_OPTIONS = [
  { value: '4.5', label: '4.5★ & above' },
  { value: '4', label: '4★ & above' },
  { value: '3.5', label: '3.5★ & above' },
  { value: '3', label: '3★ & above' },
];

/** One-tap hero search suggestions. */
const POPULAR_SEARCHES = ['Restaurants', 'Cafés', 'Coaching', 'Hospitals', 'Gyms'];

// 1234 → "1.2k"
const formatCount = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

// Laravel paginator ({ data, current_page, ... }) or a plain array.
const asList = (res: any): any[] => (Array.isArray(res) ? res : res?.data || []);

/**
 * Numbered-pagination page list: the first two pages, the current page with
 * its neighbours and the last two, collapsing the gaps into "…" markers.
 */
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

/**
 * Hero artwork — a stylized cable-stayed bridge (the Digha–Sonpur rail-road
 * bridge) drawn as line art in the same visual language as the site footer.
 */
function BridgeArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 240" fill="none" aria-hidden="true" className={className}>
      {/* Sun glow */}
      <circle cx="556" cy="54" r="24" stroke="#F4B400" strokeOpacity="0.4" strokeWidth="1.5" />
      <circle cx="556" cy="54" r="36" stroke="#F4B400" strokeOpacity="0.18" strokeWidth="1" />
      {/* Pylons */}
      <path d="M180 170 L163 46 H197 L180 170" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="2" />
      <path d="M180 96 H160 M180 120 H156 M180 144 H152" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1.5" />
      <path d="M460 170 L443 46 H477 L460 170" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="2" />
      <path d="M460 96 H440 M460 120 H436 M460 144 H432" stroke="#FFFFFF" strokeOpacity="0.3" strokeWidth="1.5" />
      {/* Cables — pylon 1 */}
      <path d="M165 54 L34 170 M167 70 L72 170 M169 86 L110 170 M171 102 L148 170 M173 118 L186 170" stroke="#F4B400" strokeOpacity="0.5" strokeWidth="1.4" />
      <path d="M195 54 L326 170 M193 70 L288 170 M191 86 L250 170 M189 102 L212 170 M187 118 L174 170" stroke="#F4B400" strokeOpacity="0.5" strokeWidth="1.4" />
      {/* Cables — pylon 2 */}
      <path d="M445 54 L334 170 M447 70 L372 170 M449 86 L410 170 M451 102 L448 170 M453 118 L486 170" stroke="#F4B400" strokeOpacity="0.5" strokeWidth="1.4" />
      <path d="M475 54 L606 170 M473 70 L568 170 M471 86 L530 170 M469 102 L492 170 M467 118 L454 170" stroke="#F4B400" strokeOpacity="0.5" strokeWidth="1.4" />
      {/* Deck */}
      <path d="M0 170 H640" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="2.5" />
      <path d="M0 179 H640" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="1.5" />
      {/* Water */}
      <path d="M28 204 q18 -9 36 0 t36 0 t36 0 t36 0" stroke="#F4B400" strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M388 216 q18 -9 36 0 t36 0 t36 0" stroke="#FFFFFF" strokeOpacity="0.22" strokeWidth="1.5" />
      {/* Birds */}
      <path d="M96 58 q6 -9 12 0 M108 58 q6 -9 12 0" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Hero copy — supplied by the server pages so /explore and /explore/[filter]
 * keep their own titles, subtitles and breadcrumbs while this client component
 * owns the search state that lives inside the hero.
 */
export interface ExploreHeroConfig {
  breadcrumb?: ReactNode;
  title: ReactNode;
  subtitle?: string;
}

/**
 * Shared Explore browser — powers both /explore and /explore/[filter].
 * Renders the navy hero (breadcrumb, title, search bar, bridge line-art), the
 * floating filter toolbar, the quick-filter tabs, the sidebar / drawer filter
 * panel, the compact results grid with numbered pagination and the
 * "Own a Business" CTA band — all in the site theme (navy #062B49, gold #F4B400).
 */
export default function ExploreBrowser({
  initialFilter = 'trending',
  hero,
}: {
  initialFilter?: string;
  hero?: ExploreHeroConfig;
}) {
  // Unknown ?filter values fall back to trending instead of rendering nothing.
  const filterKey = FILTER_LABELS[initialFilter] ? initialFilter : 'trending';
  const naturalSort = FILTER_DEFAULT_SORT[filterKey] || 'created_at';

  // ── Filter state ────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [minRating, setMinRating] = useState('');
  const [openNow, setOpenNow] = useState(false);
  const [sort, setSort] = useState(naturalSort);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Re-align the sort control when the quick-filter tab changes (render-phase
  // reset — the documented React pattern for adjusting state on prop change).
  const [sortFilterKey, setSortFilterKey] = useState(filterKey);
  if (sortFilterKey !== filterKey) {
    setSortFilterKey(filterKey);
    setSort(naturalSort);
  }

  // ── Results state ───────────────────────────────────────────────────────
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // ── Filter option data (categories + areas come from the API) ───────────
  const [categories, setCategories] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, ars] = await Promise.all([
          // Popular slice of the 3.8k+ category list — the dropdown also has
          // server-side search, so nothing is unreachable.
          api.getCategories({ limit: 300 }),
          api.getAreas(),
        ]);
        if (cancelled) return;
        setCategories(asList(cats));
        setAreas(asList(ars));
      } catch {
        // Filters simply stay empty when the API is unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Pagination resets to page 1 whenever any filter changes.
  const currentQueryKey = [
    filterKey,
    sort,
    debouncedSearch,
    categoryId,
    areaId,
    minRating,
  ].join('|');
  const [paging, setPaging] = useState({ key: currentQueryKey, page: 1 });
  if (paging.key !== currentQueryKey) setPaging({ key: currentQueryKey, page: 1 });

  // Load the requested page on every filter / page change. Numbered
  // pagination replaces the grid instead of appending rows.
  useEffect(() => {
    let cancelled = false;
    const requestPage = paging.page;

    const load = async () => {
      setLoading(true);

      const params: Record<string, any> = {
        page: requestPage,
        per_page: PER_PAGE,
        sort_by: sort,
        sort_order: 'desc',
        ...(FILTER_BASE_PARAMS[filterKey] || {}),
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (categoryId) params.category_id = categoryId;
      if (areaId) params.area_id = areaId;
      if (minRating) params.min_rating = minRating;

      try {
        const res: any = await api.getBusinesses(params);
        const list = asList(res);
        if (cancelled) return;
        setItems(list);
        setMeta({
          current_page: res?.current_page ?? 1,
          last_page: res?.last_page ?? 1,
          total: res?.total ?? list.length,
        });
        // Bring the results back into view when paging deeper.
        if (requestPage > 1) {
          requestAnimationFrame(() =>
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          );
        }
      } catch {
        if (cancelled) return;
        setItems([]);
        setMeta({ current_page: 1, last_page: 1, total: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [filterKey, sort, debouncedSearch, categoryId, areaId, minRating, paging.page]);

  // Lock body scroll while the mobile filters drawer is open.
  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileFiltersOpen]);

  // Remote category search — the dropdown list only holds the top 300 rows.
  const searchCategories = useCallback(
    async (query: string): Promise<FilterOption[]> => {
      try {
        const res: any = await api.getCategories({ search: query, limit: 50 });
        return asList(res).map((c: any) => ({ value: String(c.id), label: c.name }));
      } catch {
        return [];
      }
    },
    [],
  );

  // ── Derived values ───────────────────────────────────────────────────────
  const categoryOptions = useMemo<FilterOption[]>(
    () => categories.map((c: any) => ({ value: String(c.id), label: c.name })),
    [categories],
  );

  const areaOptions = useMemo<FilterOption[]>(
    () =>
      [...areas]
        .sort((a, b) => (b.businesses_count || 0) - (a.businesses_count || 0))
        .map((a: any) => ({ value: String(a.id), label: a.name })),
    [areas],
  );

  // Open Now is evaluated on the loaded rows — the API has no open_now param.
  const visibleItems = useMemo(
    () => (openNow ? items.filter((b) => b?.is_open_now === true) : items),
    [items, openNow],
  );

  const openCount = useMemo(
    () => items.filter((b) => b?.is_open_now === true).length,
    [items],
  );

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onClear: () => void }[] = [];
    if (debouncedSearch) {
      chips.push({
        key: 'search',
        label: `\u201C${debouncedSearch}\u201D`,
        onClear: () => setSearch(''),
      });
    }
    const cat = categories.find((c: any) => String(c.id) === categoryId);
    if (categoryId) {
      chips.push({
        key: 'category',
        label: cat?.name || 'Category',
        onClear: () => setCategoryId(''),
      });
    }
    const area = areas.find((a: any) => String(a.id) === areaId);
    if (areaId) {
      chips.push({
        key: 'area',
        label: area?.name || 'Area',
        onClear: () => setAreaId(''),
      });
    }
    if (minRating) {
      chips.push({
        key: 'rating',
        label: `${minRating}\u2605 & above`,
        onClear: () => setMinRating(''),
      });
    }
    if (openNow) {
      chips.push({ key: 'open', label: 'Open Now', onClear: () => setOpenNow(false) });
    }
    return chips;
  }, [debouncedSearch, categories, categoryId, areas, areaId, minRating, openNow]);

  const clearAll = () => {
    setSearch('');
    setCategoryId('');
    setAreaId('');
    setMinRating('');
    setOpenNow(false);
  };

  const filterLabel = FILTER_LABELS[filterKey] || 'Explore';
  // "1–12 of 248 results" — the slice the current page covers.
  const resultFrom = meta.total === 0 ? 0 : (meta.current_page - 1) * PER_PAGE + 1;
  const resultTo = Math.min(meta.current_page * PER_PAGE, meta.total);

  const goToPage = (page: number) => {
    if (page < 1 || page > meta.last_page || page === meta.current_page) return;
    setPaging({ key: currentQueryKey, page });
  };

  // Sidebar / drawer filter panel — checkbox-style single-select rows driving
  // the same category / area / rating params as before (UI-only redesign).
  const renderFilterPanel = () => (
    <div>
      <div className="flex items-center justify-between px-1 pb-1">
        <p className="font-heading text-sm font-extrabold uppercase tracking-wide text-[#062B49]">
          Refine Results
        </p>
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
        <FilterCheckRow
          label="All Categories"
          active={!categoryId}
          onClick={() => setCategoryId('')}
        />
        {categories.map((c: any) => (
          <FilterCheckRow
            key={c.id}
            label={c.name}
            count={c.businesses_count}
            active={categoryId === String(c.id)}
            onClick={() =>
              setCategoryId(categoryId === String(c.id) ? '' : String(c.id))
            }
          />
        ))}
        {categories.length === 0 && (
          <p className="px-2 py-3 text-xs text-gray-400">Loading categories…</p>
        )}
      </FilterGroup>

      <FilterGroup title="Areas">
        <FilterCheckRow label="All Areas" active={!areaId} onClick={() => setAreaId('')} />
        {areaOptions.map((o) => {
          const area = areas.find((a: any) => String(a.id) === o.value);
          return (
            <FilterCheckRow
              key={o.value}
              label={o.label}
              count={area?.businesses_count}
              active={areaId === o.value}
              onClick={() => setAreaId(areaId === o.value ? '' : o.value)}
            />
          );
        })}
        {areaOptions.length === 0 && (
          <p className="px-2 py-3 text-xs text-gray-400">Loading areas…</p>
        )}
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

      <div className="border-t border-gray-100 px-1 py-4">
        <button
          type="button"
          onClick={() => setOpenNow((v) => !v)}
          aria-pressed={openNow}
          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          <span className="font-semibold text-[#062B49]">Open Now</span>
          <span
            aria-hidden="true"
            className={`relative h-5 w-9 rounded-full transition-colors ${
              openNow ? 'bg-emerald-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                openNow ? 'left-[18px]' : 'left-0.5'
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#062B49] pt-20 text-white sm:pt-24 md:pt-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#062B49] via-[#083455] to-[#0B4A6F]" />
        {/* Soft gold glow accents */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#F4B400]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-[#F4B400]/10 blur-3xl" />
        {/* Bridge line-art (the approved hero fallback — matches footer style) */}
        <BridgeArt className="pointer-events-none absolute bottom-0 right-0 hidden w-[420px] select-none opacity-90 sm:block lg:w-[580px]" />

        <div className="relative mx-auto max-w-[1240px] px-4 pb-9 sm:px-6 sm:pb-10 lg:px-8">
          {hero?.breadcrumb}

          <h1 className="mt-3 max-w-2xl font-heading text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl">
            {hero?.title ?? 'Explore Businesses in Patna'}
          </h1>
          {hero?.subtitle && (
            <p className="mt-2 max-w-xl text-sm text-gray-300 sm:text-base">
              {hero.subtitle}
            </p>
          )}

          {/* Search bar */}
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              // Apply immediately instead of waiting for the debounce.
              setDebouncedSearch(search.trim());
            }}
            className="mt-4 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 shadow-2xl shadow-black/25"
          >
            <svg
              className="ml-3.5 h-5 w-5 shrink-0 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses, areas or services…"
              aria-label="Search businesses"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-[#062B49] placeholder:text-gray-400 focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="shrink-0 rounded-full bg-[#F4B400] px-5 py-2.5 text-sm font-bold text-[#062B49] transition-colors hover:bg-[#FFDF80]"
            >
              Search
            </button>
          </form>

          {/* Popular one-tap searches */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Popular:
            </span>
            {POPULAR_SEARCHES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSearch(s)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-gray-200 transition-colors hover:border-[#F4B400]/50 hover:text-[#F4B400]"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Signature line — same branding accent as the rest of the site */}
          <div className="mt-4 flex items-center gap-2 text-[#F4B400]">
            <span className="text-lg" aria-hidden="true">✨</span>
            <span className="text-sm font-semibold italic sm:text-base">
              Smart City, Made Smarter!
            </span>
            <span className="text-lg" aria-hidden="true">❤️</span>
          </div>
        </div>
      </section>

      {/* ── Floating filter toolbar ──────────────────────────────────────── */}
      <div className="relative z-30 mx-auto -mt-8 max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-xl shadow-[#062B49]/10 sm:p-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterDropdown
              label="All Categories"
              allLabel="All Categories"
              value={categoryId}
              onChange={setCategoryId}
              options={categoryOptions}
              searchable
              remoteSearch={searchCategories}
              icon={<StoreIcon />}
            />

            <FilterDropdown
              label="All Areas"
              allLabel="All Areas"
              value={areaId}
              onChange={setAreaId}
              options={areaOptions}
              searchable
              icon={<PinIcon />}
            />

            <FilterDropdown
              label="All Ratings"
              allLabel="All Ratings"
              value={minRating}
              onChange={setMinRating}
              options={RATING_OPTIONS}
              icon={<StarIcon />}
            />

            <button
              type="button"
              onClick={() => setOpenNow((v) => !v)}
              aria-pressed={openNow}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                openNow
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-gray-200 bg-white text-[#062B49] hover:border-[#FFDF80] hover:bg-[#FFF9E5]'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${openNow ? 'bg-green-500' : 'bg-gray-400'}`} />
              Open Now
            </button>

            {/* Mobile: open the filters drawer */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[#062B49] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#144272] lg:hidden"
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {activeChips.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F4B400] px-1 text-[11px] font-bold text-[#062B49]">
                  {activeChips.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick-filter tabs — kept from the previous design */}
          <div className="mt-3 flex gap-2 overflow-x-auto border-t border-gray-100 pt-3 scrollbar-hide">
            {EXPLORE_FILTERS.map((f) => {
              const active = f.key === filterKey;
              return (
                <Link
                  key={f.key}
                  href={`/explore/${f.key}`}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap rounded-lg border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                    active
                      ? 'border-[#062B49] bg-[#062B49] text-white'
                      : 'border-gray-200 bg-white text-[#062B49] hover:border-[#FFDF80] hover:bg-[#FFF9E5]'
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Filters
              </span>
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
      <div
        ref={resultsRef}
        className="mx-auto max-w-[1240px] scroll-mt-6 px-4 pb-14 pt-8 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden w-[250px] shrink-0 lg:block">
            <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              {renderFilterPanel()}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            {/* Results header */}
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-extrabold text-[#062B49] sm:text-2xl">
                  {filterKey === 'trending' || filterKey === 'all'
                    ? 'Explore Businesses in Patna'
                    : `${filterLabel} Businesses in Patna`}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {loading ? (
                    'Loading results…'
                  ) : (
                    <>
                      Showing{' '}
                      <span className="font-semibold text-[#062B49]">
                        {resultFrom}–{resultTo}
                      </span>{' '}
                      of{' '}
                      <span className="font-semibold text-[#062B49]">{meta.total}</span> results
                      {openNow && meta.total > 0 && (
                        <span className="text-gray-400"> · {openCount} open now</span>
                      )}
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden text-xs font-semibold uppercase tracking-wide text-gray-400 sm:block">
                  Sort by
                </span>
                <FilterDropdown
                  label="Newest First"
                  allLabel="Newest First"
                  value={sort}
                  onChange={setSort}
                  options={SORT_OPTIONS}
                  align="right"
                  icon={<SortIcon />}
                />
              </div>
            </div>

            {loading ? (
              <GridSkeleton />
            ) : visibleItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleItems.map((business: any) => (
                    <ExploreBusinessCard key={business.id} business={business} />
                  ))}
                </div>

                {meta.last_page > 1 && (
                  <PaginationNav
                    current={meta.current_page}
                    last={meta.last_page}
                    onPage={goToPage}
                  />
                )}
              </>
            ) : (
              <EmptyState
                openNowOnly={openNow && items.length > 0}
                hasFilters={activeChips.length > 0}
                onClear={clearAll}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Own a Business CTA ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#062B49] via-[#083455] to-[#0B4A6F] px-6 py-10 sm:px-10 lg:py-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#F4B400]/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[#F4B400]/10 blur-3xl" />
          {/* Monument line-art (background) */}
          <svg
            viewBox="0 0 120 90"
            className="pointer-events-none absolute bottom-0 left-1/2 hidden w-64 -translate-x-1/4 text-white opacity-[0.09] lg:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            aria-hidden="true"
          >
            <path d="M60 4v6M60 10a10 10 0 0 1 10 10v5H50v-5a10 10 0 0 1 10-10zM30 34l30-11 30 11M26 40h68M32 46v23M46 46v23M60 46v23M74 46v23M88 46v23M28 69h64M24 75h72M20 82h80" />
          </svg>

          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            {/* Left — heading, copy, CTA */}
            <div className="max-w-md">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F4B400] text-[#062B49]">
                  <PinIcon className="h-4 w-4" />
                </span>
                <h2 className="font-heading text-xl font-extrabold text-white sm:text-2xl">
                  Own a Business in Patna?
                </h2>
              </div>
              <p className="mt-3 text-sm text-gray-300">
                List your business for free and reach thousands of potential customers.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                <Link
                  href="/add-business"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#F4B400] px-5 py-2.5 text-sm font-bold text-[#062B49] transition-colors hover:bg-[#FFDF80]"
                >
                  Add Your Business
                  <ArrowIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/claim-business"
                  className="text-xs font-semibold text-gray-300 underline-offset-4 transition-colors hover:text-[#F4B400] hover:underline"
                >
                  or claim an existing listing
                </Link>
              </div>
            </div>

            {/* Right — three quick benefits */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:flex-shrink-0">
              <CtaFeature
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125z" />
                  </svg>
                }
                label="Get More Visibility"
              />
              <CtaFeature
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0z" />
                  </svg>
                }
                label="Attract Local Customers"
              />
              <CtaFeature
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5z" />
                  </svg>
                }
                label="Grow Your Business"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile filters drawer ────────────────────────────────────────── */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
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

function EmptyState({
  openNowOnly,
  hasFilters,
  onClear,
}: {
  openNowOnly: boolean;
  hasFilters: boolean;
  onClear: () => void;
}) {
  const title = openNowOnly
    ? 'No businesses open right now'
    : hasFilters
      ? 'No businesses match these filters'
      : 'No businesses found';

  const text = openNowOnly
    ? 'Nothing in this result set is open at the moment — turn off \u201COpen Now\u201D to see them all.'
    : hasFilters
      ? 'Try a different category, area or rating, or clear the filters to start over.'
      : 'Check back later for more listings.';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center">
      <span className="w-16 h-16 rounded-full bg-[#FFF9E5] flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-[#F4B400]"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2 6a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </span>
      <h3 className="font-heading text-lg font-bold text-[#062B49]">{title}</h3>
      <p className="text-sm text-gray-500 mt-1.5 max-w-md mx-auto">{text}</p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 mt-5 px-5 py-2.5 rounded-xl bg-[#062B49] text-white text-sm font-semibold hover:bg-[#144272] transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

/** Loading placeholder matching the compact card geometry. */
function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white"
        >
          <div className="h-44 bg-gray-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3.5 w-1/3 rounded bg-gray-100" />
            <div className="h-3.5 w-1/2 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

type FilterOption = { value: string; label: string };

/** Collapsible-looking section inside the filter panel. */
function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-gray-100 px-1 py-4 first:border-t-0">
      <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-gray-400">
        {title}
      </p>
      <div className="max-h-52 space-y-0.5 overflow-y-auto scrollbar-hide">{children}</div>
    </div>
  );
}

/**
 * Checkbox-style row. Visually multi-select, but selection stays single-value
 * (toggling a row clears the previous one) so the API params — category_id,
 * area_id, min_rating — remain exactly what they were before the redesign.
 */
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
        active
          ? 'bg-[#FFF9E5] font-semibold text-[#062B49]'
          : 'text-gray-600 hover:bg-gray-50'
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
      {typeof count === 'number' && (
        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-500">
          {formatCount(count)}
        </span>
      )}
    </button>
  );
}

/** Numbered pagination: < 1 2 3 … 21 > with the gold active state. */
function PaginationNav({
  current,
  last,
  onPage,
}: {
  current: number;
  last: number;
  onPage: (page: number) => void;
}) {
  const pages = getPageList(current, last);

  return (
    <nav aria-label="Pagination" className="mt-9 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onPage(current - 1)}
        disabled={current <= 1}
        aria-label="Previous page"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#062B49] transition-colors hover:border-[#FFDF80] hover:bg-[#FFF9E5] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`dots-${i}`} className="px-1.5 text-sm font-semibold text-gray-400" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            aria-current={p === current ? 'page' : undefined}
            className={`h-10 min-w-[2.5rem] rounded-xl border px-3 text-sm font-bold transition-colors ${
              p === current
                ? 'border-[#F4B400] bg-[#F4B400] text-[#062B49] shadow-sm'
                : 'border-gray-200 bg-white text-[#062B49] hover:border-[#FFDF80] hover:bg-[#FFF9E5]'
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
        aria-label="Next page"
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#062B49] transition-colors hover:border-[#FFDF80] hover:bg-[#FFF9E5] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7-7 7M3 12h18" />
        </svg>
      </button>
    </nav>
  );
}

/** Inline feature (icon + two-line label) inside the "Own a Business" CTA band. */
function CtaFeature({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <span className="text-[#F4B400]">{icon}</span>
      <p className="max-w-[7rem] text-xs font-semibold leading-snug text-white sm:text-sm">
        {label}
      </p>
    </div>
  );
}

/* ────────────────────────── Filter dropdown (accessible) ───────────────── */

function FilterDropdown({
  label,
  allLabel,
  value,
  onChange,
  options,
  icon,
  searchable = false,
  remoteSearch,
  align = 'left',
}: {
  label: string;
  allLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  icon: React.ReactNode;
  searchable?: boolean;
  remoteSearch?: (query: string) => Promise<FilterOption[]>;
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [remote, setRemote] = useState<FilterOption[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Debounced remote search — powers the 3.8k+ category list
  useEffect(() => {
    if (!open || !searchable || !remoteSearch || query.trim().length < 2) {
      setRemote([]);
      return;
    }
    let cancelled = false;
    const q = query.trim();
    const t = setTimeout(async () => {
      const res = await remoteSearch(q);
      if (!cancelled) setRemote(res);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, query, searchable, remoteSearch]);

  const merged = useMemo(() => {
    const map = new Map<string, FilterOption>();
    [...options, ...remote].forEach((o) => {
      if (!map.has(o.value)) map.set(o.value, o);
    });
    const list = Array.from(map.values());
    const q = query.trim().toLowerCase();
    // Local options are filtered client-side; remote results are already
    // server-filtered, so they are never hidden here.
    return q && !remoteSearch ? list.filter((o) => o.label.toLowerCase().includes(q)) : list;
  }, [options, remote, query, remoteSearch]);

  const selected = [...options, ...remote].find((o) => o.value === value);
  const isActive = Boolean(value);

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
          isActive
            ? 'bg-[#FFF9E5] border-[#FFDF80] text-[#062B49]'
            : 'bg-white border-gray-200 text-[#062B49] hover:border-[#FFDF80] hover:bg-[#FFF9E5]'
        }`}
      >
        {icon}
        <span className="max-w-[140px] truncate">{selected ? selected.label : label}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute z-40 mt-2 w-72 rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {searchable && (
            <div className="p-2.5 border-b border-gray-100">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label.replace(/^All /, '').toLowerCase()}…`}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-[#062B49] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFF4CC] focus:border-[#FFDF80]"
              />
            </div>
          )}

          <ul role="listbox" className="max-h-64 overflow-y-auto py-1.5">
            <li>
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                  setQuery('');
                }}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-[#FFF9E5] transition-colors ${
                  !value ? 'font-semibold' : ''
                }`}
              >
                <span className="text-[#062B49]">{allLabel}</span>
                {!value && <CheckIcon />}
              </button>
            </li>
            {merged.length === 0 ? (
              <li className="px-3.5 py-6 text-center text-sm text-gray-400">No matches found</li>
            ) : (
              merged.map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-left hover:bg-[#FFF9E5] transition-colors"
                  >
                    <span className="truncate text-gray-700">{o.label}</span>
                    {value === o.value && <CheckIcon />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────── Icons ─────────────────────────────── */

function StoreIcon({ className = 'w-4 h-4 text-[#D89E00]' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v5.25m0 0 1.5 10.5h13.5l1.5-10.5m-16.5 0h16.5M8.25 3.75v5.25m7.5-5.25v5.25M3 9h18" />
    </svg>
  );
}

function PinIcon({ className = 'w-4 h-4 text-[#D89E00]' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657 13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}

function StarIcon({ className = 'w-4 h-4 text-[#F4B400]' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292z" />
    </svg>
  );
}

function SortIcon({ className = 'w-4 h-4 text-[#D89E00]' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M10 18h4" />
    </svg>
  );
}

function ArrowIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7-7 7M3 12h18" />
    </svg>
  );
}

function CheckIcon({ className = 'w-4 h-4 text-[#D89E00]' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function FunnelIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3z" />
    </svg>
  );
}