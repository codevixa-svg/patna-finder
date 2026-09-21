import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

interface BusinessCardProps {
  business: {
    id: number;
    name: string;
    slug: string;
    category?: { name: string };
    area?: { name: string };
    rating: number;
    review_count: number;
    cover_image?: string;
    logo?: string;
    is_verified?: boolean;
    verification_label?: string;
    verification_level?: string;
    is_featured?: boolean;
    is_trending?: boolean;
    opening_hours?: any;
    city?: string;
  };
}

// Build an absolute image URL from backend storage paths (/storage/...).
// Uses a plain <img> (not next/image) so backend-hosted images render
// directly without the Next.js image optimizer, which rejects
// http://localhost:8000 sources in development (400 "url parameter is
// not allowed") and left cards with broken images.
const buildImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/storage/')) return `${API_BASE_URL}${path}`;
  if (path.startsWith('storage/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function BusinessCard({ business }: BusinessCardProps) {
  const rating = Number(business.rating || 0);

  const renderStars = (value: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < Math.floor(value) ? 'text-[#F4B400]' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <Link href={`/business/${business.slug}`} className="card group cursor-pointer">
      {/* Cover Image */}
      <div className="relative h-48 -m-6 mb-4 overflow-hidden rounded-t-[20px]">
        {business.cover_image ? (
          <img
            src={buildImageUrl(business.cover_image)}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#FFF4CC] to-[#FFF4CC] flex items-center justify-center">
            <span className="text-6xl">🏢</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 right-4 space-y-2">
          {business.is_verified ? (
            <div
              className={`badge badge-verified ${business.verification_level === 'premium' ? 'ring-2 ring-yellow-400' : ''}`}
              title={business.verification_label || 'Verified Business'}
            >
              <span>{business.verification_level === 'premium' ? '★' : '✓'}</span> Verified
            </div>
          ) : (
            <div className="badge badge-not-verified" title="Patna Finder team ne is business ki verification nahi ki hai">
              <span>◌</span> Not Verified
            </div>
          )}
          {business.is_featured && (
            <div className="badge badge-featured">
              <span>⭐</span> Featured
            </div>
          )}
          {business.is_trending && (
            <div className="badge" style={{ background: '#FEF3C7', color: '#92400E' }}>
              <span>🔥</span> Trending
            </div>
          )}
        </div>

        {/* Logo */}
        {business.logo && (
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full border-4 border-white overflow-hidden shadow-lg">
            <img src={buildImageUrl(business.logo)} alt={business.name} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#D89E00] transition line-clamp-1">
            {business.name}
          </h3>
          <p className="text-sm text-gray-500">{business.category?.name || 'Business'}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex">{renderStars(rating)}</div>
          <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
          <span className="text-sm text-gray-500">({business.review_count || 0} reviews)</span>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{business.area?.name || business.city || 'Patna'}</span>
        </div>

        {/* View Profile Button */}
        <button className="w-full mt-4 bg-gray-50 hover:bg-[#FFF9E5] text-gray-900 font-semibold py-3 px-4 rounded-xl transition group-hover:bg-[#FFF9E5] border border-gray-100">
          View Profile →
        </button>
      </div>
    </Link>
  );
}
