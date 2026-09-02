'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import CategoryIcon from '@/components/CategoryIcon';

interface TrendingBusinessCardProps {
  business: any;
  rank?: number;
  isSaved?: boolean;
  onToggleSave?: (id: number) => void;
}

// Vibrant palette for category badges. The colour is picked from a hash of the
// business id, so it *looks* random but stays stable between re-renders —
// different businesses get different colours, the same business never jumps.
const CATEGORY_BADGE_COLORS = [
  'bg-indigo-600',
  'bg-blue-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-rose-600',
  'bg-red-600',
  'bg-orange-600',
  'bg-amber-600',
  'bg-yellow-600',
  'bg-lime-600',
  'bg-green-600',
  'bg-emerald-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-sky-600',
  'bg-violet-600',
  'bg-fuchsia-600',
];

const pickCategoryColor = (seed: number | string | undefined): string => {
  const str = String(seed ?? 'business');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return CATEGORY_BADGE_COLORS[hash % CATEGORY_BADGE_COLORS.length];
};

// Build an absolute image URL from backend storage paths (/storage/...)
const buildImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/storage/')) return `${API_BASE_URL}${path}`;
  if (path.startsWith('storage/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const toMinutes = (t: string): number | null => {
  const m = String(t).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = m[3]?.toUpperCase();
  if (ap === 'PM' && h < 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
};

// Compute Open Now / Closed — prefers backend-computed is_open_now (timezone-safe)
// and falls back to evaluating opening_hours in browser time.
const getOpenStatus = (
  business: any,
  nowTime: Date | null,
): { isOpen: boolean } | null => {
  if (typeof business?.is_open_now === 'boolean') {
    return { isOpen: business.is_open_now };
  }
  if (!nowTime) return null;
  try {
    let hours = business?.opening_hours;
    if (typeof hours === 'string') {
      try {
        hours = JSON.parse(hours);
      } catch {
        return null;
      }
    }
    if (!hours || typeof hours !== 'object') return null;
    const dayNames = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const today = hours[dayNames[nowTime.getDay()]];
    if (!today || typeof today !== 'object') return null;
    const isOpenDay =
      typeof today.is_open === 'boolean' ? today.is_open : !(today.closed ?? false);
    if (!isOpenDay) return { isOpen: false };
    const openT = today.open_time || today.open;
    const closeT = today.close_time || today.close;
    if (!openT || !closeT) return null;
    const openM = toMinutes(openT);
    const closeM = toMinutes(closeT);
    if (openM === null || closeM === null) return null;
    const nowM = nowTime.getHours() * 60 + nowTime.getMinutes();
    const isOpen =
      closeM <= openM
        ? nowM >= openM || nowM <= closeM
        : nowM >= openM && nowM <= closeM;
    return { isOpen };
  } catch {
    return null;
  }
};

export default function TrendingBusinessCard({
  business,
  rank,
  isSaved,
  onToggleSave,
}: TrendingBusinessCardProps) {
  const [nowTime, setNowTime] = useState<Date | null>(null);
  useEffect(() => {
    setNowTime(new Date());
  }, []);

  const openStatus = getOpenStatus(business, nowTime);
  const categoryColor = pickCategoryColor(business.id ?? business.slug);
  const profileUrl = `/business/${business.slug || business.id}`;
  const image = business.cover_image || business.featured_image || business.logo;

  return (
    <Link href={profileUrl} className="group block h-full">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 h-full">
        {/* Cover image */}
        <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {image ? (
            <img
              src={buildImageUrl(image)}
              alt={business.name || 'Business'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <CategoryIcon icon={business.category?.icon} className="w-12 h-12 text-amber-700" />
            </div>
          )}

          {/* Rank Badge */}
          {typeof rank === 'number' && rank > 0 && (
            <div className="absolute top-3 left-3 bg-gray-900/90 text-amber-400 text-xs font-extrabold px-2.5 py-1.5 rounded-lg shadow-md">
              #{rank}
            </div>
          )}

          {/* Bookmark / Save Button */}
          {typeof isSaved === 'boolean' && onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave(business.id);
              }}
              aria-label={isSaved ? 'Remove from saved' : 'Save business'}
              className="absolute top-3 right-3 w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition"
            >
              <svg
                className={`w-4 h-4 ${isSaved ? 'text-amber-500' : 'text-gray-700'}`}
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          )}

          {/* Category Pill — random background colour */}
          {business.category?.name && (
            <div
              className={`absolute bottom-3 left-3 ${categoryColor} text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-md`}
            >
              {business.category.name}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Name + Verified Badge */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <h3 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-blue-600 transition">
              {business.name}
            </h3>
            {business.is_verified && (
              <svg
                className="w-4 h-4 text-blue-500 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {/* Rating + Reviews */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg
              className="w-4 h-4 text-amber-400 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-gray-900">
              {Number(business.rating || 0).toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">
              ({business.review_count || 0} reviews)
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <svg
              className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="line-clamp-1">
              {business.area?.name || business.city || 'Patna'}, Patna
            </span>
          </div>

          {/* Open Status + View Profile */}
          <div className="flex items-center justify-between">
            {openStatus ? (
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    openStatus.isOpen ? 'bg-green-500' : 'bg-red-500'
                  }`}
                ></span>
                <span
                  className={`text-xs font-medium ${
                    openStatus.isOpen ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {openStatus.isOpen ? 'Open Now' : 'Closed'}
                </span>
              </div>
            ) : (
              <span></span>
            )}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 group-hover:bg-gray-100 transition">
              <span className="text-xs font-semibold text-gray-700">
                View Profile
              </span>
              <svg
                className="w-3.5 h-3.5 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
