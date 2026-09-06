/**
 * Explore quick-filter definitions — shared by the client-side ExploreBrowser
 * component and server-side files (sitemap, /explore/[filter] metadata).
 * Kept free of 'use client' so plain values can be imported into
 * server components without turning into client-reference proxies.
 */
export const EXPLORE_FILTERS = [
  { key: 'trending', label: 'Trending' },
  { key: 'highest-rated', label: 'Highest Rated' },
  { key: 'recently-added', label: 'Recently Added' },
  { key: 'hidden-gems', label: 'Hidden Gems' },
  { key: 'featured', label: "Editor's Picks" },
] as const;

export const isValidExploreFilter = (filter: string) =>
  EXPLORE_FILTERS.some((f) => f.key === filter);

export const FILTER_LABELS: Record<string, string> = Object.fromEntries(
  EXPLORE_FILTERS.map((f) => [f.key, f.label]),
);