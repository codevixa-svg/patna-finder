'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const BACKEND_URL = API_URL.replace('/api/v1', '');

const getImageUrl = (value: any): string => {
  if (!value) return '';
  const raw =
    typeof value === 'string'
      ? value
      : value?.url || value?.image || value?.path || value?.image_url || '';

  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  if (raw.startsWith('/storage/')) return `${BACKEND_URL}${raw}`;
  if (raw.startsWith('storage/')) return `${BACKEND_URL}/${raw}`;
  if (raw.startsWith('/')) return `${BACKEND_URL}${raw}`;
  return raw;
};

const safeJson = <T,>(value: unknown, fallback: T): T => {
  if (!value) return fallback;
  if (typeof value !== 'string') return value as T;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const Icon = ({
  name,
  className = 'w-5 h-5',
}: {
  name: string;
  className?: string;
}) => {
  const common = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    viewBox: '0 0 24 24',
    strokeWidth: 1.8,
  };

  switch (name) {
    case 'location':
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21s7-6.1 7-12a7 7 0 10-14 0c0 5.9 7 12 7 12z"
          />
          <circle cx="12" cy="9" r="2.2" />
        </svg>
      );

    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path strokeLinecap="round" d="M12 7v5l3.5 2" />
        </svg>
      );

    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.8 9h16.4M3.8 15h16.4M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5s-1.1 6.2-3.2 8.5c-2.1-2.3-3.2-5.1-3.2-8.5S9.9 5.8 12 3.5z" />
        </svg>
      );

    case 'share':
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="2.2" />
          <circle cx="6" cy="12" r="2.2" />
          <circle cx="18" cy="19" r="2.2" />
          <path d="m8 11 7.8-4.5M8 13l7.8 4.5" />
        </svg>
      );

    case 'bookmark':
      return (
        <svg {...common}>
          <path d="M6.5 4.5A1.5 1.5 0 0 1 8 3h8a1.5 1.5 0 0 1 1.5 1.5V21l-5.5-3-5.5 3V4.5z" />
        </svg>
      );

    case 'phone':
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 4.5A2.5 2.5 0 0 1 7.5 2H9l2 4-2 1.5a13.5 13.5 0 0 0 6 6L16.5 11l4 2v1.5a2.5 2.5 0 0 1-2.5 2.5C10.82 17 7 13.18 7 8V6.5A2.5 2.5 0 0 1 5 4.5z"
          />
        </svg>
      );

    case 'check':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
        </svg>
      );

    case 'arrow-left':
      return (
        <svg {...common}>
          <path strokeLinecap="round" d="M19 12H6M12 5l-7 7 7 7" />
        </svg>
      );

    case 'chevron-right':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
        </svg>
      );

    case 'home':
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5"
          />
        </svg>
      );

    case 'megaphone':
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5 6 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l5 4V5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
          />
        </svg>
      );

    case 'navigation':
      return (
        <svg {...common}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
          />
        </svg>
      );

    default:
      return null;
  }
};

const StarRating = ({
  rating = 4.8,
  count,
}: {
  rating?: number | string;
  count?: number | string;
}) => (
  <div className="flex items-center gap-1">
    <span className="text-yellow-500 text-sm">★</span>
    <span className="font-bold text-gray-900">{rating}</span>
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="text-[11px] text-yellow-500">
          ★
        </span>
      ))}
    </div>
    {count !== undefined && (
      <span className="text-xs text-gray-500">({count} Reviews)</span>
    )}
  </div>
);

const SocialIcon = ({ type, url }: { type: string; url?: string }) => {
  if (!url) return null;

  const styles: Record<string, string> = {
    facebook: 'bg-[#1877F2]',
    instagram: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    twitter: 'bg-black',
    linkedin: 'bg-[#0A66C2]',
    youtube: 'bg-[#FF0000]',
    whatsapp_business: 'bg-[#25D366]',
  };

  const labels: Record<string, string> = {
    facebook: 'f',
    instagram: '◎',
    twitter: '𝕏',
    linkedin: 'in',
    youtube: '▶',
    whatsapp_business: '◔',
  };

  return (
    <a
      href={type === 'whatsapp_business' ? `https://wa.me/${url}` : url}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-8 h-8 rounded-full ${styles[type] || 'bg-gray-700'} text-white flex items-center justify-center font-bold text-xs hover:scale-105 transition`}
    >
      {labels[type] || type.substring(0, 1).toUpperCase()}
    </a>
  );
};

export default function PublicBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [updates, setUpdates] = useState<any[]>([]);
  const [activeUpdate, setActiveUpdate] = useState<any>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetchBusiness();
  }, [businessId]);

  // Update detail modal: Escape to close + body scroll lock
  useEffect(() => {
    if (!activeUpdate) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveUpdate(null);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [activeUpdate]);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      // Public API endpoint (no authentication required)
      const response = await fetch(`${API_URL}/businesses/${businessId}`);
      
      if (!response.ok) {
        throw new Error('Business not found');
      }
      
      const result = await response.json();
      // Handle response structure
      setBusiness(result.data || result);

      // Business updates (sidebar) — optional, fail silently
      try {
        const updatesRes = await fetch(
          `${API_URL}/businesses/${businessId}/updates`,
        );
        if (updatesRes.ok) {
          const updatesJson = await updatesRes.json();
          setUpdates(
            Array.isArray(updatesJson.data) ? updatesJson.data : [],
          );
          setActiveSlide(0);
        }
      } catch {
        // Updates are optional
      }
    } catch (error) {
      console.error('Failed to fetch business:', error);
      toast.error('Business not found');
      router.push('/businesses');
    } finally {
      setLoading(false);
    }
  };

  const data = useMemo(() => {
    if (!business) return null;

    const openingHours = safeJson<Record<string, any>>(
      business.opening_hours,
      {},
    );
    const services = safeJson<any[]>(business.services, []);
    const socialLinks = safeJson<Record<string, any>>(
      business.social_links,
      {},
    );
    const gallery = safeJson<any[]>(business.gallery, []);
    const reviews = safeJson<any[]>(business.reviews, []);
    const videos = safeJson<any[]>(business.videos, []);

    const today = new Date()
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    const todayHours = openingHours[today] || {
      is_open: true,
      open_time: '10:00 AM',
      close_time: '7:00 PM',
    };

    return {
      openingHours,
      services: Array.isArray(services) ? services : [],
      socialLinks,
      gallery: Array.isArray(gallery) ? gallery : [],
      reviews: Array.isArray(reviews) ? reviews : [],
      videos: Array.isArray(videos) ? videos : [],
      todayHours,
    };
  }, [business]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-11 h-11 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  if (!business || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h2>
          <p className="text-gray-600 mb-4">The business you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/businesses')}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  const reviewCount = business.review_count || data.reviews.length || 0;
  const rating = business.rating || 0;

  const address =
    [
      business.address,
      business.address_line2,
      business.landmark,
      business.city,
      business.state,
      business.pincode,
    ]
      .filter(Boolean)
      .join(', ') || 'Address not set';

  const website = business.website
    ? business.website.startsWith('http')
      ? business.website
      : `https://${business.website}`
    : '';

  const phone =
    business.phone ||
    business.mobile ||
    business.contact_number ||
    business.phone_number ||
    '';

  // Map (sidebar) — prefer exact coordinates, fallback to address
  const hasCoords = Boolean(business.latitude && business.longitude);
  const hasAddress = address !== 'Address not set';
  const mapQuery = hasCoords
    ? `${business.latitude},${business.longitude}`
    : hasAddress
      ? address
      : 'Patna, Bihar';
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}`;

  const formatUpdateDate = (value: any) => {
    if (!value) return '';
    try {
      return formatDistanceToNow(new Date(value), { addSuffix: true });
    } catch {
      return '';
    }
  };

  // Updates slider (GMB-style: one post at a time)
  const currentUpdate =
    updates.length > 0 ? updates[Math.min(activeSlide, updates.length - 1)] : null;
  const prevSlide = () =>
    setActiveSlide((activeSlide - 1 + updates.length) % updates.length);
  const nextSlide = () => setActiveSlide((activeSlide + 1) % updates.length);

  // CTA: "call" type -> tel: link, everything else -> normal URL
  const getCtaHref = (update: any) => {
    if (!update?.cta_url) return '';
    if (update.cta_type === 'call') {
      return `tel:${String(update.cta_url).replace(/[^\d+]/g, '')}`;
    }
    const url = String(update.cta_url);
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'Services' },
    { id: 'photos', label: 'Photos' },
    { id: 'reviews', label: `Reviews (${reviewCount})` },
    { id: 'videos', label: 'Videos' },
  ];

  const handleShare = async () => {
    const shareData = {
      title: business.name,
      text: business.short_description || business.description || '',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch {
      // User cancelled
    }
  };

  const handleContact = () => {
    if (phone) {
      window.location.href = `tel:${String(phone).replace(/\s+/g, '')}`;
      return;
    }
    toast('No contact number available');
  };

  return (
    <>
      <Toaster position="top-right" />

      <main className="bg-[#f7f8fa] min-h-screen">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-3">
            <ol className="flex items-center flex-wrap gap-x-1.5 gap-y-1 text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 text-gray-500 hover:text-[#153b78] font-medium transition"
                >
                  <Icon name="home" className="w-4 h-4" />
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-300 flex items-center">
                <Icon name="chevron-right" className="w-4 h-4" />
              </li>
              <li>
                <Link
                  href="/businesses"
                  className="text-gray-500 hover:text-[#153b78] font-medium transition"
                >
                  Businesses
                </Link>
              </li>
              {business.category?.name && (
                <>
                  <li aria-hidden="true" className="text-gray-300 flex items-center">
                    <Icon name="chevron-right" className="w-4 h-4" />
                  </li>
                  <li>
                    <Link
                      href={`/categories/${business.category.slug || ''}`}
                      className="text-gray-500 hover:text-[#153b78] font-medium transition"
                    >
                      {business.category.name}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true" className="text-gray-300 flex items-center">
                <Icon name="chevron-right" className="w-4 h-4" />
              </li>
              <li className="text-[#153b78] font-semibold truncate max-w-[260px]">
                {business.name}
              </li>
            </ol>
          </div>
        </nav>

        {/* BreadcrumbList Schema for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item:
                    typeof window !== 'undefined'
                      ? window.location.origin
                      : 'https://patnafinder.com',
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Businesses',
                  item:
                    (typeof window !== 'undefined'
                      ? window.location.origin
                      : 'https://patnafinder.com') + '/businesses',
                },
                ...(business.category?.name
                  ? [
                      {
                        '@type': 'ListItem',
                        position: 3,
                        name: business.category.name,
                        item:
                          (typeof window !== 'undefined'
                            ? window.location.origin
                            : 'https://patnafinder.com') +
                          `/categories/${business.category.slug || ''}`,
                      },
                    ]
                  : []),
                {
                  '@type': 'ListItem',
                  position: business.category?.name ? 4 : 3,
                  name: business.name,
                },
              ],
            }),
          }}
        />

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-6 items-start">
            <div className="min-w-0 space-y-5">
          {/* Hero Card */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Cover */}
            <div className="relative h-[185px]">
              <div className="absolute inset-0 overflow-hidden">
                {business.cover_image ? (
                  <img
                    src={getImageUrl(business.cover_image)}
                    alt={business.name || 'Business cover'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#17365d] via-[#1f5a8c] to-[#0b243f]">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_30%)]" />
                  </div>
                )}
              </div>

              {/* Logo */}
              <div className="absolute left-6 bottom-0 translate-y-1/2 z-10">
                <div className="w-[104px] h-[104px] rounded-xl bg-white border border-gray-200 shadow-lg p-2 flex items-center justify-center">
                  {business.logo ? (
                    <img
                      src={getImageUrl(business.logo)}
                      alt={business.name || 'Business logo'}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#153b78]">
                        {(business.name || 'AB').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="text-[9px] font-semibold text-gray-500">
                        {business.category?.name || 'BUSINESS'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="px-6 pt-16 pb-5">
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {business.name || 'Business Name'}
                    </h2>

                    {business.is_verified && (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {business.tagline || business.category?.name || 'Business'}
                  </p>

                  {business.is_verified && (
                    <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-semibold">
                      <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                        <Icon name="check" className="w-3 h-3" />
                      </span>
                      Verified Business
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Icon name="share" className="w-4 h-4" />
                    Share
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSaved(!saved);
                      toast.success(saved ? 'Removed from saved' : 'Business saved');
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 border rounded-lg text-sm font-medium transition ${
                      saved
                        ? 'border-orange-300 bg-orange-50 text-orange-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon name="bookmark" className="w-4 h-4" />
                    {saved ? 'Saved' : 'Save'}
                  </button>

                  <button
                    type="button"
                    onClick={handleContact}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold"
                  >
                    <Icon name="phone" className="w-4 h-4" />
                    Contact
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-5 mt-4 pb-4 border-b border-gray-200">
                <StarRating rating={rating} count={reviewCount} />

                <div className="flex items-center gap-1.5 text-sm">
                  <span
                    className={
                      data.todayHours.is_open === false
                        ? 'font-semibold text-red-600'
                        : 'font-semibold text-green-600'
                    }
                  >
                    {data.todayHours.is_open === false ? 'Closed' : 'Open'}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">
                    Closes at {data.todayHours.close_time || '7:00 PM'}
                  </span>
                </div>
              </div>

              {/* Contact Strip */}
              <div className="grid grid-cols-3 divide-x border-b border-gray-200">
                <div className="flex items-start gap-2.5 py-3 pr-5">
                  <Icon name="location" className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <span className="text-sm leading-5 text-gray-700">{address}</span>
                </div>

                <div className="flex items-start gap-2.5 py-3 px-5">
                  <Icon name="clock" className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div className="text-sm text-gray-700">
                    <div>
                      {data.todayHours.open_time || '10:00 AM'} -{' '}
                      {data.todayHours.close_time || '7:00 PM'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {data.todayHours.is_open !== false ? 'Open today' : 'Closed today'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 py-3 pl-5">
                  <Icon name="globe" className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  {website ? (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate"
                    >
                      {business.website}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">Website not available</span>
                  )}
                </div>
              </div>

              {/* Social Links */}
              {Object.keys(data.socialLinks).length > 0 && (
                <div className="flex items-center gap-2 pt-4">
                  {Object.entries(data.socialLinks).map(([type, value]: [string, any]) => (
                    <SocialIcon
                      key={type}
                      type={type}
                      url={typeof value === 'string' ? value : value?.url}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Tabs */}
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max px-4 border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-orange-600 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    About {business.name}
                  </h3>
                  <p className="text-sm text-gray-600 leading-7 whitespace-pre-line">
                    {business.description ||
                      business.short_description ||
                      'This business has not added a description yet.'}
                  </p>
                </div>
              )}

              {activeTab === 'services' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Our Services</h3>
                  {data.services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.services.map((service: any, index: number) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg">
                          <h4 className="font-semibold text-gray-900">{service.name || service.title}</h4>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No services listed yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'photos' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Photo Gallery</h3>
                  {data.gallery.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {data.gallery.map((img: any, index: number) => (
                        <img
                          key={index}
                          src={getImageUrl(img)}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No photos available.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h3>
                  <p className="text-sm text-gray-500">No reviews yet.</p>
                </div>
              )}

              {activeTab === 'videos' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Videos</h3>
                  <p className="text-sm text-gray-500">No videos available.</p>
                </div>
              )}
            </div>
          </section>
            </div>

            {/* Sidebar: Map + Business Updates */}
            <aside className="space-y-5 lg:sticky lg:top-24">
              {/* Map */}
              <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
                    <Icon name="location" className="w-4 h-4 text-[#153b78]" />
                    Location
                  </h3>
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#153b78] hover:text-amber-600 transition"
                  >
                    <Icon name="navigation" className="w-3.5 h-3.5" />
                    Directions
                  </a>
                </div>

                <iframe
                  title={`${business.name} location map`}
                  src={mapEmbedUrl}
                  className="w-full h-[240px] border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />

                <div className="px-4 py-3 border-t border-gray-100">
                  <p className="text-xs leading-5 text-gray-500 flex items-start gap-1.5">
                    <Icon name="location" className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{address}</span>
                  </p>
                </div>
              </section>

              {/* Business Updates */}
              <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
                    <Icon name="megaphone" className="w-4 h-4 text-amber-500" />
                    Updates
                    {updates.length > 0 && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        {updates.length}
                      </span>
                    )}
                  </h3>
                </div>

                {updates.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                      <Icon name="megaphone" className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 leading-5">
                      No updates posted yet.
                      <br />
                      Check back later for offers &amp; news.
                    </p>
                  </div>
                ) : (
                  currentUpdate && (
                    <div>
                      {/* Slide: image + slider controls (GMB style) */}
                      <div className="relative">
                        {currentUpdate.image ? (
                          <img
                            src={getImageUrl(currentUpdate.image)}
                            alt="Update"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                            className="w-full aspect-video object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-video bg-gradient-to-br from-[#17365d] via-[#1f5a8c] to-[#0b243f] flex items-center justify-center">
                            <Icon name="megaphone" className="w-8 h-8 text-white/60" />
                          </div>
                        )}

                        {updates.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={prevSlide}
                              aria-label="Previous update"
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-white hover:text-[#153b78] transition"
                            >
                              <Icon name="chevron-right" className="w-4 h-4 rotate-180" />
                            </button>
                            <button
                              type="button"
                              onClick={nextSlide}
                              aria-label="Next update"
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-md flex items-center justify-center text-gray-700 hover:bg-white hover:text-[#153b78] transition"
                            >
                              <Icon name="chevron-right" className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold">
                              {activeSlide + 1} / {updates.length}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Slide body: short description + CTA */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                            {currentUpdate.type || 'Update'}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {formatUpdateDate(currentUpdate.published_at || currentUpdate.created_at)}
                          </span>
                        </div>

                        <p
                          onClick={() => setActiveUpdate(currentUpdate)}
                          className="text-xs text-gray-600 leading-5 line-clamp-3 mb-3 cursor-pointer hover:text-[#153b78] transition"
                        >
                          {currentUpdate.content}
                        </p>

                        {currentUpdate.cta_text && currentUpdate.cta_url ? (
                          <a
                            href={getCtaHref(currentUpdate)}
                            target={currentUpdate.cta_type === 'call' ? undefined : '_blank'}
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#153b78] text-white text-xs font-semibold hover:bg-[#0f2c5c] transition"
                          >
                            {currentUpdate.cta_text}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveUpdate(currentUpdate)}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition"
                          >
                            View Details
                          </button>
                        )}

                        {/* Dots */}
                        {updates.length > 1 && (
                          <div className="flex items-center justify-center gap-1.5 mt-3">
                            {updates.map((u, idx) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => setActiveSlide(idx)}
                                aria-label={`Go to update ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all ${
                                  idx === activeSlide
                                    ? 'w-4 bg-[#153b78]'
                                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </section>
            </aside>
          </div>
        </div>

        {/* Update Detail Modal */}
        {activeUpdate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setActiveUpdate(null)}
            />
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <button
                type="button"
                onClick={() => setActiveUpdate(null)}
                aria-label="Close"
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="overflow-y-auto">
                {activeUpdate.image ? (
                  <img
                    src={getImageUrl(activeUpdate.image)}
                    alt="Update"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-[#17365d] via-[#1f5a8c] to-[#0b243f] flex items-center justify-center">
                    <Icon name="megaphone" className="w-10 h-10 text-white/60" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                      {activeUpdate.type || 'Update'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatUpdateDate(activeUpdate.published_at || activeUpdate.created_at)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 leading-6 whitespace-pre-line">
                    {activeUpdate.content}
                  </p>

                  {activeUpdate.cta_text && activeUpdate.cta_url && (
                    <a
                      href={getCtaHref(activeUpdate)}
                      target={activeUpdate.cta_type === 'call' ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="mt-5 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#153b78] text-white text-sm font-semibold hover:bg-[#0f2c5c] transition"
                    >
                      {activeUpdate.cta_text}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
