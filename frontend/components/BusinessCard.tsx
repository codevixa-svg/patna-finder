import Link from 'next/link';
import Image from 'next/image';

interface BusinessCardProps {
  business: {
    id: number;
    name: string;
    slug: string;
    category: { name: string };
    area: { name: string };
    rating: number;
    review_count: number;
    cover_image?: string;
    logo?: string;
    is_verified?: boolean;
    is_featured?: boolean;
    is_trending?: boolean;
    opening_hours?: any;
  };
}

export default function BusinessCard({ business }: BusinessCardProps) {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  return (
    <Link href={`/business/${business.slug}`} className="card group cursor-pointer">
      {/* Cover Image */}
      <div className="relative h-48 -m-6 mb-4 overflow-hidden rounded-t-[20px]">
        {business.cover_image ? (
          <Image
            src={business.cover_image}
            alt={business.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
            <span className="text-6xl">🏢</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 right-4 space-y-2">
          {business.is_verified && (
            <div className="badge badge-verified">
              <span>✓</span> Verified
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
            <Image src={business.logo} alt={business.name} fill className="object-cover" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-500 transition line-clamp-1">
            {business.name}
          </h3>
          <p className="text-sm text-gray-500">{business.category.name}</p>
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex">{renderStars(business.rating)}</div>
          <span className="text-sm font-semibold text-gray-900">{business.rating.toFixed(1)}</span>
          <span className="text-sm text-gray-500">({business.review_count} reviews)</span>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{business.area.name}</span>
        </div>

        {/* View Profile Button */}
        <button className="w-full mt-4 bg-gray-50 hover:bg-amber-50 text-gray-900 font-semibold py-3 px-4 rounded-xl transition group-hover:bg-amber-50 border border-gray-100">
          View Profile →
        </button>
      </div>
    </Link>
  );
}
