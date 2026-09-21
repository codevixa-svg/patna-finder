'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import BusinessCard from '@/components/BusinessCard';
import { EXPLORE_FILTERS, FILTER_LABELS } from '@/lib/explore-filters';

const PER_PAGE = 12;

/**
 * Quick-filter → /businesses query params. The dedicated trending / featured /
 * hidden-gems endpoints return the same rows, so the browser queries the
 * filterable /businesses endpoint instead — that way pagination, search and the
 * category / area / rating filters keep working on every tab.
 */
const FILTER_BASE_PARAMS: Record<string, Record<string, string | number>> = {
  trending: { is_trending: 1 },
  featured: { is_featured: 1 },
  'hidden-gems': { is_hidden_gem: 1 },
  'highest-rated': {},
  'recently-added': {},
};

/** Natural sort order for each quick filter (drives the sort dropdown). */
const FILTER_DEFAULT_SORT: Record<string, string> = {
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

// 1234 → "1.2k"
const formatCount = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(n);

// Laravel paginator ({ data, current_page, ... }) or a plain array.
const asList = (res: any): any[] => (Array.isArray(res) ? res : res?.data || []);

/**
 * Shared Explore browser — powers both /explore and /explore/[filter].
 * Renders the sticky filter toolbar (working category / area / rating / sort /
 * open-now controls), the quick-filter tabs, the paginated results grid and the
 * "Explore by Area" band — all in the site theme (navy #062B49, gold #F4B400).
 */
export default function ExploreBrowser({
  initialFilter = 'trending',
  showAreaSection = true,
}: {
  initialFilter?: string;
  showAreaSection?: boolean;
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
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Load page 1 on every filter change and append when "Load More" is used.
  useEffect(() => {
    let cancelled = false;
    const requestPage = paging.page;

    const load = async () => {
      if (requestPage === 1) setLoading(true);
      else setLoadingMore(true);

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
        setItems((prev) => (requestPage === 1 ? list : [...prev, ...list]));
        setMeta({
          current_page: res?.current_page ?? 1,
          last_page: res?.last_page ?? 1,
          total: res?.total ?? list.length,
        });
      } catch {
        if (cancelled) return;
        if (requestPage === 1) setItems([]);
        setMeta({ current_page: 1, last_page: 1, total: 0 });
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [filterKey, sort, debouncedSearch, categoryId, areaId, minRating, paging.page]);

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

  // ── Derived values ──────────────────────────────────────────────────────
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

  // Top localities for the "Explore by Area" band (falls back to a static
  // list when no areas are published yet).
  const topAreas = useMemo<any[]>(
    () =>
      [...areas]
        .sort((a, b) => (b.businesses_count || 0) - (a.businesses_count || 0))
        .slice(0, 8),
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
  const hasMore = meta.current_page < meta.last_page;

  return (
    <>
      {/* ── Sticky filter toolbar ───────────────────────────────────────── */}
      <section className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search businesses, services or places…"
                aria-label="Search businesses"
                className="w-full pl-11 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#062B49] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFF4CC] focus:border-[#FFDF80] transition"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

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

            <FilterDropdown
              label="Sort by"
              allLabel="Newest First"
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
              align="right"
              icon={<SortIcon />}
            />

            <button
              type="button"
              onClick={() => setOpenNow((v) => !v)}
              aria-pressed={openNow}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                openNow
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-white border-gray-200 text-[#062B49] hover:border-[#FFDF80] hover:bg-[#FFF9E5]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${openNow ? 'bg-green-500' : 'bg-gray-400'}`} />
              Open Now
            </button>

            {activeChips.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#062B49] text-white text-sm font-semibold hover:bg-[#144272] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Filters
              </span>
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onClear}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-[#FFF9E5] border border-[#FFF4CC] text-xs font-semibold text-[#062B49] hover:border-[#FFDF80] transition-colors"
                >
                  {chip.label}
                  <svg className="w-3.5 h-3.5 text-[#D89E00]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      {/* ── Quick-filter tabs ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {EXPLORE_FILTERS.map((f) => {
              const active = f.key === filterKey;
              return (
                <Link
                  key={f.key}
                  href={`/explore/${f.key}`}
                  aria-current={active ? 'page' : undefined}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-[#062B49] border-[#062B49] text-white'
                      : 'bg-white border-gray-200 text-[#062B49] hover:border-[#FFDF80] hover:bg-[#FFF9E5]'
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Results ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#062B49]">
              {filterLabel} Businesses in Patna
            </h2>
            <p className="text-sm text-gray-500 mt-1.5">
              {loading ? (
                'Loading results…'
              ) : (
                <>
                  Showing{' '}
                  <span className="font-semibold text-[#062B49]">
                    {visibleItems.length}
                  </span>{' '}
                  of <span className="font-semibold text-[#062B49]">{meta.total}</span>{' '}
                  {meta.total === 1 ? 'business' : 'businesses'}
                  {openNow && (
                    <span className="text-gray-400">
                      {' '}
                      · {openCount} open now in this list
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {openNow && (
            <span className="badge badge-open self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Open Now
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-100 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {visibleItems.map((business: any) => (
                <BusinessCard key={business.id} business={business}></BusinessCard>
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setPaging((p) => ({ ...p, page: p.page + 1 }))}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#F4B400] text-[#062B49] text-sm font-bold hover:bg-[#FFDF80] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingMore ? 'Loading…' : 'Load More Businesses'}
                </button>
                <p className="text-xs text-gray-400 mt-3">
                  Page {meta.current_page} of {meta.last_page}
                </p>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            openNowOnly={openNow && items.length > 0}
            hasFilters={activeChips.length > 0}
            onClear={clearAll}
          />
        )}
      </section>
      {/* ── Explore by Area ────────────────────────────────────────────── */}
      {showAreaSection && (
        <section className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#062B49] to-[#144272] px-6 sm:px-10 py-10 lg:py-12 overflow-hidden">
              {/* Soft glow accents */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#F4B400]/10 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#F4B400]/10 blur-3xl pointer-events-none" />

              <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                <div>
                  <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#F4B400]">
                    <PinIcon className="w-3.5 h-3.5" />
                    Locality Guides
                  </span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white mt-3">
                    Explore Patna Area by Area
                  </h2>
                  <p className="text-gray-300 text-sm mt-2 max-w-xl">
                    Pick a locality and browse its best businesses, services and hidden gems.
                  </p>
                </div>
                <Link
                  href="/areas"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#F4B400] text-[#062B49] text-sm font-bold hover:bg-[#FFDF80] transition-colors self-start sm:self-auto whitespace-nowrap"
                >
                  View All Areas
                  <ArrowIcon className="w-4 h-4" />
                </Link>
              </div>

              {topAreas.length > 0 ? (
                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
                  {topAreas.map((area: any) => (
                    <Link
                      key={area.id}
                      href={`/areas/${area.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/20 hover:border-[#F4B400]/40 px-4 py-3.5 transition-colors"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-white truncate">
                          {area.name}
                        </span>
                        <span className="block text-xs text-gray-300">
                          {formatCount(area.businesses_count || 0)} businesses
                        </span>
                      </span>
                      <ArrowIcon className="w-4 h-4 text-gray-300 group-hover:text-[#F4B400] transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="relative text-sm text-gray-300 mt-8">
                  Area guides will appear here as soon as localities are added.
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
/* ─────────────────────────── Empty state ──────────────────────────── */

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
    ? 'Nothing in this result set is open at the moment — turn off “Open Now” to see them all.'
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
/* ────────────────────── Filter dropdown (accessible) ──────────────── */

type FilterOption = { value: string; label: string };

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
/* ──────────────────────────── Icons ───────────────────────────────── */

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
