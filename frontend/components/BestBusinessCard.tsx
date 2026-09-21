'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, MapPin, Star } from 'lucide-react';
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
// directly without the Next.js image optimizer (same recipe as the
// Explore card — http://localhost:8000 sources are rejected by the
// optimizer in development).
const buildImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/storage/')) return `${API_BASE_URL}${path}`;
  if (path.startsWith('storage/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Rank badge colours — gold, silver, bronze then navy (matches the
// "Top 10 in Patna" reference design).
const RANK_STYLES: Record<number, string> = {
  1: 'bg-gradient-to-br from-[#F4B400] to-[#D89E00] text-white',
  2: 'bg-white text-[#062B49] ring-1 ring-gray-200',
  3: 'bg-gradient-to-br from-[#C2884E] to-[#A16838] text-white',
};
const DEFAULT_RANK_STYLE = 'bg-[#062B49] text-white';

/**
 * Ranked "Best of Patna" card — compact listing with a rank number badge,
 * save-to-favourites heart (persisted in localStorage), gold category chip,
 * star rating, location row, a two-line description and an outlined
 * "View Details" footer. Used on /best-of-patna.
 */
export default function BestBusinessCard({
  business,
  rank,
}: {
  business: any;
  rank: number;
}) {
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
  const badgeClass = RANK_STYLES[rank] || DEFAULT_RANK_STYLE;
  const description = business.short_description || business.description || '';

  return (
    <Link
      href={`/business/${business.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FFF4CC] hover:shadow-xl hover:shadow-[#062B49]/10"
    >
      {/* Cover */}
      <div className="relative h-40 overflow-hidden">
        {business.cover_image ? (
          <img
            src={buildImageUrl(business.cover_image)}
            alt={business.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`${categoryColor.bg} flex h-full w-full items-center justify-center`}
          >
            <span className="text-5xl opacity-80" aria-hidden="true">🏢</span>
          </div>
        )}

        {/* Rank badge */}
        <span
          className={`absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold shadow-lg ${badgeClass}`}
        >
          {rank}
        </span>

        {/* Save heart */}
        <button
          type="button"
          onClick={toggleSave}
          aria-label={saved ? 'Remove from saved' : 'Save business'}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-110"
        >
          <Heart
            className={`h-4 w-4 transition ${saved ? 'fill-[#E11D48] text-[#E11D48]' : 'text-gray-500'}`}
          />
        </button>

        {/* Gold category chip */}
        {business.category?.name && (
          <span className="absolute bottom-3 left-3 rounded-md bg-[#F4B400] px-2 py-1 text-[11px] font-bold text-[#062B49] shadow-sm">
            {business.category.name}
          </span>
        )}
      </div>
      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-[15px] font-bold text-[#062B49] transition-colors group-hover:text-[#D89E00]">
          {business.name}
        </h3>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1">
          <Star
            className="h-4 w-4 fill-[#F4B400] text-[#F4B400]"
            aria-hidden="true"
          />
          <span className="text-sm font-bold text-[#062B49]">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-400">
            ({business.review_count || 0} reviews)
          </span>
        </div>

        {/* Location */}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin
            className="h-3.5 w-3.5 shrink-0 text-[#D89E00]"
            aria-hidden="true"
          />
          <span className="truncate">
            {business.area?.name || business.city || 'Patna'}, Patna
          </span>
        </div>

        {/* Description */}
        {description && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
            {description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3">
          <span className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-bold text-[#062B49] transition group-hover:border-[#F4B400] group-hover:text-[#B58200]">
            View Details
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}