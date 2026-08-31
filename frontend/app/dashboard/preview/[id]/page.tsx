'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userBusinessApi } from '@/lib/userApi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const BACKEND_URL = API_BASE_URL.replace('/api/v1', '');

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
    case 'desktop':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M8 21h8M12 17v4M3 14h18" />
        </svg>
      );

    case 'mobile':
      return (
        <svg {...common}>
          <rect x="7" y="2.5" width="10" height="19" rx="2" />
          <path d="M10.5 5h3M11 18.5h2" />
        </svg>
      );

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

    case 'calendar':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 9h16" />
        </svg>
      );

    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20a5.5 5.5 0 0 1 11 0M17 11a3 3 0 0 1 3.5 3M16 20a5 5 0 0 0-2.5-4.4" />
        </svg>
      );

    case 'award':
      return (
        <svg {...common}>
          <path d="M7 3h10v5a5 5 0 0 1-10 0V3z" />
          <path d="M7 6H4a4 4 0 0 0 4 4M17 6h3a4 4 0 0 1-4 4M10 13v3M14 13v3M8 21h8M10 16h4" />
        </svg>
      );

    case 'edit':
      return (
        <svg {...common}>
          <path d="m14.5 5.5 4 4M4 20l4.2-.8L19.3 8.1a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20z" />
        </svg>
      );

    case 'send':
      return (
        <svg {...common}>
          <path d="m4 4 16 8-16 8 3-8-3-8zM7 12h13" />
        </svg>
      );

    case 'flag':
      return (
        <svg {...common}>
          <path d="M6 21V4m0 0c4-3 8 3 12 0v9c-4 3-8-3-12 0" />
        </svg>
      );

    case 'check':
      return (
        <svg {...common}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
        </svg>
      );

    case 'play':
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="m9 6 10 6-10 6V6z" />
        </svg>
      );

    case 'arrow':
      return (
        <svg {...common}>
          <path strokeLinecap="round" d="M5 12h13M13 6l6 6-6 6" />
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

const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase();

  if (name.includes('website') || name.includes('web')) {
    return (
      <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9.75 17 9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
      </svg>
    );
  }

  if (name.includes('social')) {
    return (
      <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
      </svg>
    );
  }

  if (name.includes('content')) {
    return (
      <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    );
  }

  return (
    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11 5.882V19.24a1.76 1.76 0 0 1-3.417.592l-2.147-6.15M18 13a3 3 0 1 0 0-6M5.436 13.683A4.001 4.001 0 0 1 7 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 0 1-1.564-.317z" />
    </svg>
  );
};

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

export default function BusinessPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;
  const { isAuthenticated } = useUserAuthStore();

  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('overview');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated) {
      router.push('/dashboard/login');
      return;
    }

    fetchBusiness();
  }, [isAuthenticated, businessId, mounted]);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const response = await userBusinessApi.getOne(Number(businessId));
      setBusiness(response.data);
    } catch (error) {
      console.error('Failed to fetch business:', error);
      toast.error('Failed to load business');
      router.push('/dashboard/businesses');
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

  const galleryImages = useMemo(() => {
    if (!data) return [];

    const featured = business?.featured_image ? [getImageUrl(business.featured_image)] : [];

    const gallery = data.gallery
      .map((item: any) => {
        if (typeof item === 'string') return getImageUrl(item);
        if (typeof item === 'object' && item !== null)
          return getImageUrl(item?.url || item?.image || item?.path || item?.image_url);
        return '';
      })
      .filter(Boolean);

    return [...featured, ...gallery];
  }, [data, business]);

  if (!mounted || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-11 h-11 rounded-full border-4 border-gray-200 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  if (!business || !data) return null;

  const activeServices = data.services.filter(
    (service: any) => service?.active !== false,
  );

  const reviewCount = business.review_count || data.reviews.length || 0;
  const rating = business.rating || 0;
  const establishedYear = Number(business.established_year || 0);
  const experience = establishedYear
    ? Math.max(0, new Date().getFullYear() - establishedYear)
    : 0;

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

  const mapQuery = (() => {
    const raw = business.google_map_location;
    if (raw) {
      try {
        const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
        const q = url.searchParams.get('q');
        if (q) return encodeURIComponent(q);
        const ll = url.searchParams.get('ll');
        if (ll) return encodeURIComponent(ll);
        const query = url.searchParams.get('query');
        if (query) return encodeURIComponent(query);
      } catch {
        if (/^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(raw.trim())) return encodeURIComponent(raw.trim());
        return encodeURIComponent(raw);
      }
    }
    if (business.latitude && business.longitude)
      return `${business.latitude},${business.longitude}`;
    return encodeURIComponent(address);
  })();

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
        toast.success('Listing link copied');
      }
    } catch {
      // User cancelled the native share dialog.
    }
  };

  const handleContact = () => {
    if (phone) {
      window.location.href = `tel:${String(phone).replace(/\s+/g, '')}`;
      return;
    }

    toast('No contact number is available for this business.');
  };

  const handleDirections = () => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${mapQuery}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <>
      <Toaster position="top-right" />

      <DashboardLayout
        pageTitle="Business Preview"
        pageSubtitle="Preview how your listing will appear to customers"
        showSaveButton={false}
      >
        {/* ========================= PAGE HEADER ========================= */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Preview Listing
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  This is how your listing will appear to the public.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/dashboard/add-business?id=${businessId}`)
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <Icon name="edit" className="w-4 h-4" />
                  Edit Listing
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toast.success('Business published successfully!')
                  }
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
                >
                  Publish Listing
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================= VIEW SWITCHER ========================= */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition ${
                  viewMode === 'desktop'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon name="desktop" className="w-4 h-4" />
                Desktop View
              </button>

              <button
                type="button"
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition ${
                  viewMode === 'mobile'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon name="mobile" className="w-4 h-4" />
                Mobile View
              </button>
            </div>
          </div>
        </section>

        {/* ========================= LISTING PREVIEW ========================= */}
        <main className="bg-[#f7f8fa] min-h-screen py-6">
          <div
            className={`mx-auto transition-all duration-300 ${
              viewMode === 'mobile'
                ? 'max-w-[420px] px-3'
                : 'max-w-[1060px] px-4 sm:px-6'
            }`}
          >
            {/* ========================= HERO CARD ========================= */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Cover */}
              <div
                className={`relative ${
                  viewMode === 'mobile' ? 'h-32 sm:h-40' : 'h-[185px]'
                }`}
              >
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
                <div className="absolute left-4 sm:left-6 bottom-0 translate-y-1/2 z-10">
                  <div className="w-[80px] h-[80px] sm:w-[104px] sm:h-[104px] rounded-xl bg-white border border-gray-200 shadow-lg p-1.5 sm:p-2 flex items-center justify-center">
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

              {/* Business heading */}
              <div className="px-4 sm:px-6 pt-[50px] sm:pt-16 pb-4 sm:pb-5">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3 sm:gap-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                        {business.name || 'Business Name'}
                      </h2>

                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>

                    <p className="text-xs sm:text-sm text-blue-600 font-medium mt-1">
                      {business.tagline ||
                        business.category?.name ||
                        'Digital Marketing Agency'}
                    </p>

                    <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-semibold">
                      <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                        <Icon name="check" className="w-3 h-3" />
                      </span>
                      Verified Business
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 bg-white rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Icon name="share" className="w-4 h-4" />
                      Share
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSaved((value) => !value);
                        toast.success(saved ? 'Removed from saved' : 'Business saved');
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm font-medium transition ${
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
                      className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs sm:text-sm font-semibold"
                    >
                      <Icon name="phone" className="w-4 h-4" />
                      Contact
                    </button>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pb-4 border-b border-gray-200">
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

                {/* Contact strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b border-gray-200">
                  <div className="flex items-start gap-2.5 py-3 md:pr-5">
                    <Icon name="location" className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm leading-5 text-gray-700">
                      {address}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 py-3 md:px-5">
                    <Icon name="clock" className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                    <div className="text-xs sm:text-sm text-gray-700">
                      <div>
                        {data.todayHours.open_time || '10:00 AM'} -{' '}
                        {data.todayHours.close_time || '7:00 PM'}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        {data.todayHours.is_open !== false ? 'Open today' : 'Closed today'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 py-3 md:pl-5">
                    <Icon name="globe" className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                    {website ? (
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs sm:text-sm text-blue-600 hover:underline truncate"
                      >
                        {business.website}
                      </a>
                    ) : (
                      <span className="text-xs sm:text-sm text-gray-500">
                        Website not available
                      </span>
                    )}
                  </div>
                </div>

                {/* Social links */}
                <div className="flex items-center gap-2 pt-4">
                  {Object.entries(data.socialLinks).map(([type, value]: [string, any]) => (
                    <SocialIcon
                      key={type}
                      type={type}
                      url={typeof value === 'string' ? value : value?.url}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* ========================= TABS ========================= */}
            <section className="mt-3 sm:mt-5 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex min-w-max px-2 sm:px-4 border-b border-gray-200">
                  {tabs.map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition whitespace-nowrap ${
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

              <div className="p-3 sm:p-5 md:p-6">
                {/* ========================= OVERVIEW ========================= */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                      {/* About */}
                      <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                          About {business.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-7 whitespace-pre-line">
                          {business.description ||
                            business.short_description ||
                            'This business has not added a detailed description yet.'}
                        </p>
                      </section>

                      {/* Stats */}
                      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-center">
                          <div className="flex justify-center text-blue-600 mb-2">
                            <Icon name="calendar" className="w-6 h-6" />
                          </div>
                          <div className="text-xl font-bold text-blue-700">
                            {experience}+
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Years Experience
                          </div>
                        </div>

                        <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-4 text-center">
                          <div className="flex justify-center text-cyan-600 mb-2">
                            <Icon name="award" className="w-6 h-6" />
                          </div>
                          <div className="text-xl font-bold text-cyan-700">
                            {business.projects_completed || '0'}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Projects Completed
                          </div>
                        </div>

                        <div className="rounded-lg border border-green-100 bg-green-50 p-4 text-center">
                          <div className="flex justify-center text-green-600 mb-2">
                            <Icon name="users" className="w-6 h-6" />
                          </div>
                          <div className="text-xl font-bold text-green-700">
                            {business.happy_clients || '0'}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Happy Clients
                          </div>
                        </div>

                        <div className="rounded-lg border border-orange-100 bg-orange-50 p-4 text-center">
                          <div className="flex justify-center text-orange-600 mb-2">
                            <Icon name="award" className="w-6 h-6" />
                          </div>
                          <div className="text-base font-bold text-orange-700">
                            {business.award_title || 'Award'}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Winning Agency
                          </div>
                        </div>
                      </section>

                      {/* Services */}
                      <section>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            Our Services
                          </h3>

                          {activeServices.length > 4 && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('services')}
                              className="text-sm text-orange-600 font-medium hover:underline"
                            >
                              View All Services
                            </button>
                          )}
                        </div>

                        {activeServices.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeServices.slice(0, 4).map(
                              (service: any, index: number) => (
                                <div
                                  key={service.id || index}
                                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition bg-white"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-11 h-11 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                                      {getServiceIcon(service.name || 'Service')}
                                    </div>

                                    <div className="min-w-0">
                                      <h4 className="font-semibold text-sm text-gray-900">
                                        {service.name}
                                      </h4>
                                      <p className="text-xs text-gray-500 leading-5 mt-1">
                                        {service.description
                                          ? String(service.description).slice(0, 100)
                                          : 'Professional service tailored to your business needs.'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-sm text-gray-500">
                            No services have been added yet.
                          </div>
                        )}
                      </section>

                      {/* Gallery */}
                      <section>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900">
                            Photo Gallery
                          </h3>

                          {galleryImages.length > 4 && (
                            <button
                              type="button"
                              onClick={() => setActiveTab('photos')}
                              className="text-sm text-orange-600 font-medium hover:underline"
                            >
                              View All Photos
                            </button>
                          )}
                        </div>

                        {galleryImages.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {galleryImages.slice(0, 4).map(
                              (image: string, index: number) => (
                                <button
                                  type="button"
                                  key={`${image}-${index}`}
                                  onClick={() => setActiveTab('photos')}
                                  className="aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 bg-gray-100 group"
                                >
                                  <img
                                    src={image}
                                    alt={`${business.name} gallery ${index + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                  />
                                </button>
                              ),
                            )}

                            {galleryImages.length > 4 && (
                              <button
                                type="button"
                                onClick={() => setActiveTab('photos')}
                                className="aspect-[4/3] rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-700 hover:bg-gray-100"
                              >
                                <span className="text-xl font-bold">
                                  +{galleryImages.length - 4}
                                </span>
                                <span className="text-xs">More Photos</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-sm text-gray-500">
                            No photos have been added yet.
                          </div>
                        )}
                      </section>

                      {/* Review */}
                      <section className="border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900">
                            What Our Clients Say
                          </h3>
                          <button
                            type="button"
                            onClick={() => setActiveTab('reviews')}
                            className="text-sm text-orange-600 font-medium hover:underline"
                          >
                            View All Reviews
                          </button>
                        </div>

                        {data.reviews.length > 0 ? (
                          <div className="space-y-3">
                            {data.reviews.slice(0, 1).map(
                              (review: any, index: number) => (
                                <div key={review.id || index}>
                                  <div className="flex items-center gap-3">
                                    {review.user?.avatar || review.avatar ? (
                                      <img
                                        src={getImageUrl(
                                          review.user?.avatar || review.avatar,
                                        )}
                                        alt={review.user?.name || review.name || 'Customer'}
                                        className="w-10 h-10 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
                                        {(review.user?.name ||
                                          review.name ||
                                          'C')
                                          .substring(0, 1)
                                          .toUpperCase()}
                                      </div>
                                    )}

                                    <div>
                                      <div className="font-semibold text-sm text-gray-900">
                                        {review.user?.name ||
                                          review.name ||
                                          'Customer'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {review.role || 'Customer'}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-2">
                                    <StarRating rating={review.rating || 5} />
                                  </div>

                                  <p className="text-sm text-gray-600 leading-6 mt-2">
                                    {review.comment ||
                                      review.review ||
                                      ''}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">
                            No reviews are available yet.
                          </div>
                        )}
                      </section>
                    </div>

                    {/* ========================= RIGHT SIDEBAR ========================= */}
                    <aside className="space-y-4 sm:space-y-5">
                      {/* Business Hours */}
                      <div className="border border-gray-200 rounded-xl p-4 sm:p-5">
                        <h3 className="font-bold text-gray-900 mb-4">
                          Business Hours
                        </h3>

                        <div className="space-y-2.5">
                          {[
                            'monday',
                            'tuesday',
                            'wednesday',
                            'thursday',
                            'friday',
                            'saturday',
                            'sunday',
                          ].map((day) => {
                            const dayData = data.openingHours[day] || null;

                            const dayName =
                              day.charAt(0).toUpperCase() + day.slice(1);

                            return (
                              <div
                                key={day}
                                className="flex items-center justify-between gap-3 text-xs"
                              >
                                <span className="text-gray-600">
                                  {dayName}
                                </span>

                                <span
                                  className={
                                    dayData === null
                                      ? 'text-gray-400'
                                      : dayData.is_open === false
                                        ? 'text-red-600 font-medium'
                                        : 'text-gray-800'
                                  }
                                >
                                  {dayData === null
                                    ? 'Not set'
                                    : dayData.is_open === false
                                      ? 'Closed'
                                      : `${dayData.open_time || '10:00 AM'} - ${
                                          dayData.close_time || '7:00 PM'
                                        }`}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => toast('Business hours are shown above.')}
                          className="w-full mt-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View Full Hours
                        </button>
                      </div>

                      {/* Map */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="h-56 bg-gray-100">
                          <iframe
                            title="Business location map"
                            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                            className="w-full h-full border-0"
                            loading="lazy"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleDirections}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Icon name="send" className="w-4 h-4" />
                          Get Directions
                        </button>
                      </div>

                      {/* Business information */}
                      <div className="border border-gray-200 rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 mb-4">
                          Business Information
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div className="flex gap-2.5">
                            <Icon
                              name="calendar"
                              className="w-4 h-4 text-gray-400 shrink-0"
                            />
                            <div>
                              <span className="text-gray-500">
                                Year Established:{' '}
                              </span>
                              <span className="font-medium text-gray-900">
                                {business.established_year || 'Not set'}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2.5">
                            <Icon
                              name="users"
                              className="w-4 h-4 text-gray-400 shrink-0"
                            />
                            <div>
                              <span className="text-gray-500">Team Size: </span>
                              <span className="font-medium text-gray-900">
                                {business.team_size || 'Not set'}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2.5">
                            <Icon
                              name="award"
                              className="w-4 h-4 text-gray-400 shrink-0"
                            />
                            <div>
                              <span className="text-gray-500">
                                Payment Options:{' '}
                              </span>
                              <span className="font-medium text-gray-900">
                                {business.payment_options || 'Not set'}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2.5">
                            <Icon
                              name="globe"
                              className="w-4 h-4 text-gray-400 shrink-0"
                            />
                            <div>
                              <span className="text-gray-500">Languages: </span>
                              <span className="font-medium text-gray-900">
                                {business.languages || 'Not set'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 mt-5 pt-5">
                          <h4 className="font-semibold text-sm text-gray-900 mb-3">
                            Share this Business
                          </h4>

                          <div className="flex items-center gap-2">
                            {Object.entries(data.socialLinks).map(
                              ([type, value]: [string, any]) => (
                                <SocialIcon
                                  key={type}
                                  type={type}
                                  url={
                                    typeof value === 'string'
                                      ? value
                                      : value?.url
                                  }
                                />
                              ),
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                toast('Report functionality can be connected to your API.')
                              }
                              className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50"
                            >
                              <Icon name="flag" className="w-3.5 h-3.5" />
                              Report Business
                            </button>
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                )}

                {/* ========================= SERVICES ========================= */}
                {activeTab === 'services' && (
                  <section>
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          All Services
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Services offered by {business.name}.
                        </p>
                      </div>
                    </div>

                    {activeServices.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeServices.map((service: any, index: number) => (
                          <div
                            key={service.id || index}
                            className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                                {getServiceIcon(service.name || 'Service')}
                              </div>

                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">
                                  {service.name}
                                </h4>

                                {service.description && (
                                  <p className="text-sm text-gray-600 leading-6 mt-1">
                                    {service.description}
                                  </p>
                                )}

                                {service.price && (
                                  <div className="text-sm font-bold text-orange-600 mt-3">
                                    {service.price}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                        No services have been added yet.
                      </div>
                    )}
                  </section>
                )}

                {/* ========================= PHOTOS ========================= */}
                {activeTab === 'photos' && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900">
                      Photo Gallery
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 mb-5">
                      Photos uploaded for this business listing.
                    </p>

                    {galleryImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryImages.map((image: string, index: number) => (
                          <div
                            key={`${image}-${index}`}
                            className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
                          >
                            <img
                              src={image}
                              alt={`${business.name} photo ${index + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                        No photos have been added yet.
                      </div>
                    )}
                  </section>
                )}

                {/* ========================= REVIEWS ========================= */}
                {activeTab === 'reviews' && (
                  <section>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Customer Reviews
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          See what customers are saying about this business.
                        </p>
                      </div>

                      <div className="rounded-lg bg-orange-50 px-4 py-3">
                        <StarRating rating={rating} count={reviewCount} />
                      </div>
                    </div>

                    {data.reviews.length > 0 ? (
                      <div className="space-y-4">
                        {data.reviews.map((review: any, index: number) => (
                          <article
                            key={review.id || index}
                            className="border border-gray-200 rounded-xl p-5"
                          >
                            <div className="flex items-center gap-3">
                              {review.user?.avatar || review.avatar ? (
                                <img
                                  src={getImageUrl(
                                    review.user?.avatar || review.avatar,
                                  )}
                                  alt={review.user?.name || review.name || 'Customer'}
                                  className="w-11 h-11 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                  {(review.user?.name || review.name || 'C')
                                    .substring(0, 1)
                                    .toUpperCase()}
                                </div>
                              )}

                              <div>
                                <div className="font-semibold text-gray-900">
                                  {review.user?.name ||
                                    review.name ||
                                    'Customer'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {review.role || 'Customer'}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3">
                              <StarRating rating={review.rating || 0} />
                            </div>

                            <p className="text-sm text-gray-600 leading-6 mt-3">
                              {review.comment ||
                                review.review ||
                                ''}
                            </p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="p-10 border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                        No reviews are available yet.
                      </div>
                    )}
                  </section>
                )}

                {/* ========================= VIDEOS ========================= */}
                {activeTab === 'videos' && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900">
                      Business Videos
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 mb-5">
                      Videos associated with this business listing.
                    </p>

                    {data.videos.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {data.videos.map((video: any, index: number) => {
                          const url =
                            typeof video === 'string'
                              ? video
                              : video?.url || video?.video_url;

                          return (
                            <a
                              key={video?.id || index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center group"
                            >
                              {video?.thumbnail || video?.thumbnail_url ? (
                                <img
                                  src={getImageUrl(
                                    video.thumbnail || video.thumbnail_url,
                                  )}
                                  alt={video.title || 'Business video'}
                                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                                />
                              ) : null}

                              <span className="relative z-10 w-14 h-14 rounded-full bg-white/95 text-orange-600 flex items-center justify-center shadow-lg">
                                <Icon name="play" className="w-6 h-6 ml-0.5" />
                              </span>

                              {video?.title && (
                                <span className="absolute left-4 bottom-4 right-4 z-10 text-white font-semibold text-sm drop-shadow">
                                  {video.title}
                                </span>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-10 border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                        No videos have been added yet.
                      </div>
                    )}
                  </section>
                )}
              </div>
            </section>
          </div>
        </main>
      </DashboardLayout>
    </>
  );
}
