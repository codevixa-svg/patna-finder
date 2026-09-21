'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { pickCategoryColorPair } from '@/lib/categoryColors';

const SAVED_KEY = 'pf_saved_businesses';

// Read the saved-business id list from localStorage (client only).
const readSaved = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

// Build an absolute image URL from backend storage paths (/storage/...).
// Uses a plain <img> (not next/image) so backend-hosted images render
// directly without the Next.js image optimizer, which rejects
// http://localhost:8000 sources in development (same recipe as BusinessCard).
const buildImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/storage/')) return `${API_BASE_URL}${path}`;
  if (path.startsWith('storage/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * Compact explore card — the denser listing style used on /explore:
 * cover image with an overlaid category chip, a save-to-favourites heart
 * (persisted in localStorage), verified badge, rating pill, area row with an
 * "Open Now" dot and a "View Profile" footer.
 */
export default function ExploreBusinessCard({ business }: { business: any }) {
  const rating = Number(business.rating || 0);
  const [saved, setSaved] = useState(false);

  // Sync the heart with localStorage after mount. SSR-safe: the first paint
  // is always "unsaved", so server and client markup match.
  useEffect(() => {
    setSaved(readSaved().includes(String(business.id)));
  }, [business.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((prev) => {
      const next = !prev;
      try {
        const ids = new Set(readSaved());
        if (next) ids.add(String(business.id));
        else ids.delete(String(business.id));
        window.localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(ids)));
      } catch {
        // Storage unavailable — the heart still toggles for this session.
      }
      return next;
    });
  };

  const categoryColor = pickCategoryColorPair(
    business.category?.name || business.category_id || business.id,
  );

  return (
    <Link
      href={`/business/${business.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FFF4CC] hover:shadow-xl hover:shadow-[#062B49]/10"
    >
      {/* Cover */}
      <div className="relative h-44 overflow-hidden">
        {business.cover_image ? (
          <img
            src={buildImageUrl(business.cover_image)}
            alt={business.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`${categoryColor.bg} flex h-full w-full items-center justify-center`}>
            <span className="text-5xl opacity-80" aria-hidden="true">🏢</span>
          </div>
        )}

        {/* Category chip */}
        {business.category?.name && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${categoryColor.bg} ${categoryColor.text}`}
          >
            {business.category.name}
          </span>
        )}

        {/* Save (heart) */}
        <button
          type="button"
          onClick={toggleSave}
          aria-label={saved ? 'Remove from saved businesses' : 'Save business'}
          aria-pressed={saved}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110"
        >
          <svg
            className={`h-[18px] w-[18px] transition-colors ${saved ? 'text-red-500' : 'text-gray-400'}`}
            fill={saved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </button>

        {/* Verified badge */}
        {business.is_verified && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-emerald-600 shadow-sm">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              />
            </svg>
            Verified
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-base font-bold text-[#062B49] transition-colors group-hover:text-[#D89E00]">
          {business.name}
        </h3>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-md bg-[#FFF9E5] px-1.5 py-0.5 text-xs font-bold text-[#062B49]">
            <svg className="h-3.5 w-3.5 text-[#F4B400]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">({business.review_count || 0} reviews)</span>
        </div>

        {/* Location + Open Now */}
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="h-3.5 w-3.5 shrink-0 text-[#D89E00]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{business.area?.name || business.city || 'Patna'}</span>
          {business.is_open_now === true && (
            <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Open Now
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-sm font-bold text-[#062B49] transition-colors group-hover:text-[#D89E00]">
            View Profile
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFF9E5] text-[#D89E00] transition-transform group-hover:translate-x-0.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7-7 7M3 12h18" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}