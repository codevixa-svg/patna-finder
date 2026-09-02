'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userBusinessApi } from '@/lib/userApi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const BACKEND_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

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
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const asBool = (value: any, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'on', 'verified', 'approved'].includes(
      value.trim().toLowerCase(),
    );
  }
  return fallback;
};

const formatTime = (value: any) => {
  if (!value) return '';
  const raw = String(value).trim();
  if (/am|pm/i.test(raw)) return raw;

  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;

  let hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${suffix}`;
};

const getHoursParts = (hours: any) => {
  if (!hours) return { open: '', close: '', isOpen: false };

  const isOpen =
    hours.is_open !== undefined
      ? asBool(hours.is_open)
      : hours.open !== undefined || hours.open_time !== undefined;

  return {
    open: formatTime(hours.open_time ?? hours.open),
    close: formatTime(hours.close_time ?? hours.close),
    isOpen,
  };
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
      return <svg {...common}><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4M3 14h18" /></svg>;
    case 'mobile':
      return <svg {...common}><rect x="7" y="2.5" width="10" height="19" rx="2" /><path d="M10.5 5h3M11 18.5h2" /></svg>;
    case 'edit':
      return <svg {...common}><path d="m14.5 5.5 4 4M4 20l4.2-.8L19.3 8.1a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20z" /></svg>;
    case 'share':
      return <svg {...common}><circle cx="18" cy="5" r="2.2" /><circle cx="6" cy="12" r="2.2" /><circle cx="18" cy="19" r="2.2" /><path d="m8 11 7.8-4.5M8 13l7.8 4.5" /></svg>;
    case 'bookmark':
      return <svg {...common}><path d="M6.5 4.5A1.5 1.5 0 0 1 8 3h8a1.5 1.5 0 0 1 1.5 1.5V21l-5.5-3-5.5 3V4.5z" /></svg>;
    case 'phone':
      return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="M5 4.5A2.5 2.5 0 0 1 7.5 2H9l2 4-2 1.5a13.5 13.5 0 0 0 6 6L16.5 11l4 2v1.5a2.5 2.5 0 0 1-2.5 2.5C10.82 17 7 13.18 7 8V6.5A2.5 2.5 0 0 1 5 4.5z" /></svg>;
    case 'location':
      return <svg {...common}><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z" /><circle cx="12" cy="9" r="2.2" /></svg>;
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path strokeLinecap="round" d="M12 7v5l3.5 2" /></svg>;
    case 'globe':
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M3.8 9h16.4M3.8 15h16.4M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5s-1.1 6.2-3.2 8.5c-2.1-2.3-3.2-5.1-3.2-8.5S9.9 5.8 12 3.5z" /></svg>;
    case 'calendar':
      return <svg {...common}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 9h16" /></svg>;
    case 'users':
      return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M17 11a3 3 0 0 1 3.5 3M16 20a5 5 0 0 0-2.5-4.4" /></svg>;
    case 'award':
      return <svg {...common}><path d="M7 3h10v5a5 5 0 0 1-10 0V3z" /><path d="M7 6H4a4 4 0 0 0 4 4M17 6h3a4 4 0 0 1-4 4M10 13v3M14 13v3M8 21h8M10 16h4" /></svg>;
    case 'send':
      return <svg {...common}><path d="m4 4 16 8-16 8 3-8-3-8zM7 12h13" /></svg>;
    case 'flag':
      return <svg {...common}><path d="M6 21V4m0 0c4-3 8 3 12 0v9c-4 3-8-3-12 0" /></svg>;
    case 'check':
      return <svg {...common}><path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" /></svg>;
    case 'play':
      return <svg {...common} fill="currentColor" stroke="none"><path d="m9 6 10 6-10 6V6z" /></svg>;
    default:
      return null;
  }
};

const VerifiedTick = () => (
  <span
    title="Verified Business"
    aria-label="Verified Business"
    className="inline-flex items-center justify-center shrink-0"
  >
    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  </span>
);

const StarRating = ({ rating, count }: { rating: any; count?: any }) => {
  const numeric = Number(rating) || 0;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[#f5a400] text-sm">★</span>
      <span className="font-bold text-gray-900 text-sm">{numeric.toFixed(1)}</span>
      <div className="flex gap-[1px]">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-[11px] text-[#f5a400]">
            ★
          </span>
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500">({count} Reviews)</span>
      )}
    </div>
  );
};

const SocialIcon = ({ type, url }: { type: string; url?: string }) => {
  if (!url) return null;

  const normalized = type.toLowerCase().replace(/[-\s]/g, '_');
  const href =
    normalized.includes('whatsapp')
      ? `https://wa.me/${String(url).replace(/[^\d+]/g, '')}`
      : url;

  const styles: Record<string, string> = {
    facebook: 'bg-[#1877F2]',
    instagram: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    twitter: 'bg-black',
    x: 'bg-black',
    linkedin: 'bg-[#0A66C2]',
    youtube: 'bg-[#FF0000]',
    whatsapp: 'bg-[#25D366]',
    whatsapp_business: 'bg-[#25D366]',
  };

  const labels: Record<string, string> = {
    facebook: 'f',
    instagram: '◎',
    twitter: '𝕏',
    x: '𝕏',
    linkedin: 'in',
    youtube: '▶',
    whatsapp: '◔',
    whatsapp_business: '◔',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`w-8 h-8 rounded-full ${styles[normalized] || 'bg-gray-700'} text-white flex items-center justify-center font-bold text-xs hover:scale-105 transition`}
    >
      {labels[normalized] || normalized.substring(0, 1).toUpperCase()}
    </a>
  );
};

const serviceIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('web')) return '🌐';
  if (n.includes('social')) return '👥';
  if (n.includes('content')) return '✎';
  if (n.includes('marketing')) return '📣';
  if (n.includes('food') || n.includes('restaurant')) return '🍽';
  return '✓';
};

function PreviewListingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get('id');

  const { isAuthenticated } = useUserAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('overview');
  const [saved, setSaved] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/dashboard/login');
      return;
    }
    if (businessId) fetchBusiness();
  }, [isAuthenticated, router, mounted, businessId]);

  const fetchBusiness = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const response = await userBusinessApi.getOne(Number(businessId));
      setBusiness(response.data);
    } catch (error) {
      console.error('Failed to fetch business:', error);
      toast.error('Failed to load business details');
      router.push('/dashboard/businesses');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!businessId) return;
    setPublishing(true);
    const toastId = toast.loading('Publishing your listing...');
    try {
      await userBusinessApi.update(Number(businessId), { status: 'pending' });

      toast.success('Listing published successfully! Pending admin approval.', {
        id: toastId,
      });

      [
        'addBusinessFormData',
        'addBusinessServices',
        'addBusinessOpeningHours',
        'addBusinessSocialLinks',
        'addBusinessCurrentStep',
        'addBusinessSecondaryCategories',
        'addBusinessGalleryPhotos',
      ].forEach((key) => localStorage.removeItem(key));

      setTimeout(() => router.push('/dashboard/businesses'), 1500);
    } catch (error: any) {
      console.error('Publish error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to publish listing',
        { id: toastId },
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/add-business?id=${businessId}`);
  };

  const data = useMemo(() => {
    if (!business) return null;

    const openingHours = safeJson<Record<string, any>>(business.opening_hours, {});
    const services = safeJson<any[]>(business.services, []);
    const amenities = safeJson<any[]>(business.amenities, []);
    const socialLinks = safeJson<Record<string, any>>(business.social_links, {});
    const gallery = safeJson<any[]>(business.gallery, []);
    const videos = safeJson<any[]>(business.videos, []);
    const reviews = Array.isArray(business.reviews)
      ? business.reviews
      : safeJson<any[]>(business.reviews, []);
    const awards = Array.isArray(business.awards)
      ? business.awards
      : safeJson<any[]>(business.awards, []);
    const faqs = Array.isArray(business.faqs)
      ? business.faqs
      : safeJson<any[]>(business.faqs, []);

    const verified =
      asBool(business.is_verified) ||
      asBool(business.verified) ||
      asBool(business.isVerified);

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const todayParts = getHoursParts(openingHours[today]);

    const allGallery = [
      business.featured_image,
      ...gallery,
    ].filter(Boolean);

    return {
      openingHours,
      services: Array.isArray(services) ? services : [],
      amenities: Array.isArray(amenities) ? amenities : [],
      socialLinks,
      gallery: Array.isArray(allGallery) ? allGallery : [],
      videos: Array.isArray(videos) ? videos : [],
      reviews: Array.isArray(reviews) ? reviews : [],
      awards: Array.isArray(awards) ? awards : [],
      faqs: Array.isArray(faqs) ? faqs : [],
      verified,
      todayParts,
    };
  }, [business]);

  if (!mounted || loading || !business || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  const reviewCount = Number(business.review_count ?? data.reviews.length ?? 0);
  const rating = Number(business.rating ?? 0);
  const establishedYear = Number(business.established_year || 0);
  const experience = establishedYear
    ? Math.max(0, new Date().getFullYear() - establishedYear)
    : 0;

  const activeServices = data.services.filter(
    (service: any) => service?.active !== false,
  );

  const address = [
    business.address,
    business.address_line2,
    business.landmark,
    business.city,
    business.state,
    business.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const website = business.website
    ? /^https?:\/\//i.test(business.website)
      ? business.website
      : `https://${business.website}`
    : '';

  const mapQuery = (() => {
    const raw = business.google_map_location;
    if (raw) {
      try {
        const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
        const q = url.searchParams.get('q');
        if (q) return q;
        const ll = url.searchParams.get('ll');
        if (ll) return ll;
        const query = url.searchParams.get('query');
        if (query) return query;
      } catch {
        if (/^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(raw.trim())) return raw.trim();
        return raw;
      }
    }
    if (business.latitude && business.longitude)
      return `${business.latitude},${business.longitude}`;
    return address;
  })();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'Services' },
    { id: 'photos', label: 'Photos' },
    { id: 'reviews', label: `Reviews (${reviewCount})` },
    { id: 'videos', label: 'Videos' },
  ];

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: business.name,
          text: business.short_description || business.description || '',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Listing link copied');
      }
    } catch {
      // cancelled
    }
  };

  const handleContact = () => {
    const phone =
      business.phone ||
      business.alternate_phone ||
      business.whatsapp ||
      '';

    if (!phone) {
      toast('No contact number is available.');
      return;
    }

    window.location.href = `tel:${String(phone).replace(/\s+/g, '')}`;
  };

  const galleryImages = data.gallery.map(getImageUrl).filter(Boolean);

  return (
    <>
      <Toaster position="top-right" />

      <DashboardLayout
        pageTitle="Preview Listing"
        pageSubtitle="This is how your listing will appear to the public."
        showSaveButton={false}
      >
        {/* Preview controls */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Preview Listing</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  This is how your listing will appear to the public.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Icon name="edit" className="w-4 h-4" />
                  Edit Listing
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {publishing ? 'Publishing...' : 'Publish Listing'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* View switcher */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6">
            <div className="flex items-center">
              <button
                onClick={() => setViewMode('desktop')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 ${
                  viewMode === 'desktop'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                <Icon name="desktop" className="w-4 h-4" />
                Desktop View
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 ${
                  viewMode === 'mobile'
                    ? 'border-orange-600 text-orange-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                <Icon name="mobile" className="w-4 h-4" />
                Mobile View
              </button>
            </div>
          </div>
        </section>

        <main className="bg-[#f7f8fa] min-h-screen py-6">
          <div
            className={`mx-auto transition-all ${
              viewMode === 'mobile'
                ? 'max-w-[430px] px-3'
                : 'max-w-[1180px] px-4 sm:px-6'
            }`}
          >
            {/* ================= HERO - SECOND IMAGE STYLE ================= */}
            <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Cover image */}
              <div className="relative h-[120px] sm:h-[150px] md:h-[170px]">
                <div className="absolute inset-0 overflow-hidden">
                  {business.cover_image ? (
                    <img
                      src={getImageUrl(business.cover_image)}
                      alt={business.name || 'Business cover'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#102b50] via-[#173d66] to-[#071a32]" />
                  )}
                </div>

                {/* logo - overlaps cover bottom */}
                <div className="absolute left-4 sm:left-6 md:left-7 bottom-0 translate-y-1/2 z-20">
                  <div className="w-[80px] h-[80px] sm:w-[104px] sm:h-[104px] bg-white rounded-xl border border-gray-200 shadow-lg p-1.5 sm:p-2 flex items-center justify-center overflow-hidden">
                    {business.logo ? (
                      <img
                        src={getImageUrl(business.logo)}
                        alt={`${business.name || 'Business'} logo`}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[#153b78]">
                          {(business.name || 'AB').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="text-[9px] font-semibold text-gray-500 uppercase">
                          {business.category?.name || 'Business'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main business header */}
              <div className="px-4 sm:px-6 md:px-7 pt-[50px] sm:pt-[62px] pb-0">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-3 sm:gap-5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-[23px] md:text-[25px] font-bold text-gray-900 leading-tight">
                        {business.name || 'Business Name'}
                      </h2>

                      {/* Blue verified tick - always shown in preview */}
                      <VerifiedTick />
                    </div>

                    <p className="text-xs sm:text-sm md:text-[15px] text-blue-600 font-medium mt-1">
                      {business.tagline ||
                        business.category?.name ||
                        'Business & Services'}
                    </p>

                    {data.verified && (
                      <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-semibold">
                        <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                          <Icon name="check" className="w-3 h-3" />
                        </span>
                        Verified Business
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap items-center gap-2 xl:pt-0">
                    <button
                      onClick={handleShare}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 bg-white rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Icon name="share" className="w-4 h-4" />
                      Share
                    </button>

                    <button
                      onClick={() => {
                        const next = !saved;
                        setSaved(next);
                        toast.success(next ? 'Business saved' : 'Removed from saved');
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-xs sm:text-sm font-medium ${
                        saved
                          ? 'border-orange-300 bg-orange-50 text-orange-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon name="bookmark" className="w-4 h-4" />
                      {saved ? 'Saved' : 'Save'}
                    </button>

                    <button
                      onClick={handleContact}
                      className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs sm:text-sm font-semibold"
                    >
                      <Icon name="phone" className="w-4 h-4" />
                      Contact
                    </button>
                  </div>
                </div>

                {/* Rating / status row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pb-4 border-b border-gray-200">
                  <StarRating rating={rating} count={reviewCount} />

                  <div className="flex items-center gap-1.5 text-sm">
                    <span
                      className={`font-semibold ${
                        data.todayParts.isOpen
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {data.todayParts.isOpen ? 'Open' : 'Closed'}
                    </span>
                    {data.todayParts.close && (
                      <>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">
                          Closes at {data.todayParts.close}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Contact strip */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                  <div className="flex items-start gap-2.5 py-3 md:py-4 md:pr-5">
                    <Icon name="location" className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm leading-5 text-gray-700">
                      {address || 'Address not added'}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 py-3 md:py-4 md:px-5">
                    <Icon name="clock" className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-gray-700">
                      <div>
                        {data.todayParts.open || '10:00 AM'} -{' '}
                        {data.todayParts.close || '7:00 PM'}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400 mt-1">
                        Business Hours
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 py-3 md:py-4 md:pl-5 min-w-0">
                    <Icon name="globe" className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
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
                {Object.keys(data.socialLinks).length > 0 && (
                  <div className="flex items-center gap-2 py-4">
                    {Object.entries(data.socialLinks).map(
                      ([type, value]: [string, any]) => {
                        const url =
                          typeof value === 'string'
                            ? value
                            : value?.enabled === false
                              ? ''
                              : value?.url;
                        return <SocialIcon key={type} type={type} url={url} />;
                      },
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Tabs */}
            <section className="mt-3 sm:mt-5 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex min-w-max px-2 sm:px-4 border-b border-gray-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap ${
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
                {/* Overview */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                      <section>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">
                          About {business.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-7 whitespace-pre-line">
                          {business.description ||
                            business.short_description ||
                            'No description provided.'}
                        </p>
                      </section>

                      <section className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
                          <Icon name="calendar" className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 mx-auto mb-1.5 sm:mb-2" />
                          <div className="text-lg sm:text-xl font-bold text-gray-900">
                            {experience ? `${experience}+` : '—'}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            Years Experience
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
                          <Icon name="award" className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500 mx-auto mb-1.5 sm:mb-2" />
                          <div className="text-lg sm:text-xl font-bold text-gray-900">
                            {business.projects_completed || '—'}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            Projects Completed
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
                          <Icon name="users" className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mx-auto mb-1.5 sm:mb-2" />
                          <div className="text-lg sm:text-xl font-bold text-gray-900">
                            {business.happy_clients || '—'}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            Happy Clients
                          </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-3 sm:p-4 text-center">
                          <Icon name="award" className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mx-auto mb-1.5 sm:mb-2" />
                          <div className="text-sm sm:text-base font-bold text-gray-900">
                            {data.awards[0]?.title ||
                              data.awards[0]?.name ||
                              business.award_title ||
                              '—'}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            Award
                          </div>
                        </div>
                      </section>

                      {activeServices.length > 0 && (
                        <section>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900">
                              Our Services
                            </h3>
                            {activeServices.length > 4 && (
                              <button
                                onClick={() => setActiveTab('services')}
                                className="text-sm text-orange-600 font-medium"
                              >
                                View All Services
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeServices.slice(0, 4).map(
                              (service: any, index: number) => (
                                <div
                                  key={service.id || index}
                                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-11 h-11 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center text-xl shrink-0">
                                      {service.icon || serviceIcon(service.name || '')}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-900">
                                        {service.name || 'Service'}
                                      </h4>
                                      <p className="text-xs text-gray-500 leading-5 mt-1">
                                        {service.description || 'Professional service tailored to your needs.'}
                                      </p>
                                      {service.price && (
                                        <p className="text-xs text-orange-600 font-semibold mt-1">
                                          {service.price}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </section>
                      )}

                      {data.amenities.length > 0 && (
                        <section>
                          <h3 className="text-lg font-bold text-gray-900 mb-3">
                            Amenities
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {data.amenities.map((amenity: any, index: number) => (
                              <span
                                key={index}
                                className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700"
                              >
                                {typeof amenity === 'string'
                                  ? amenity
                                  : amenity?.name || amenity?.title || 'Amenity'}
                              </span>
                            ))}
                          </div>
                        </section>
                      )}

                      {galleryImages.length > 0 && (
                        <section>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900">
                              Photo Gallery
                            </h3>
                            {galleryImages.length > 4 && (
                              <button
                                onClick={() => setActiveTab('photos')}
                                className="text-sm text-orange-600 font-medium"
                              >
                                View All Photos
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {galleryImages.slice(0, 4).map((image, index) => (
                              <div
                                key={`${image}-${index}`}
                                className="aspect-[4/3] rounded-lg overflow-hidden border border-gray-200"
                              >
                                <img
                                  src={image}
                                  alt={`${business.name} ${index + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition"
                                />
                              </div>
                            ))}
                            {galleryImages.length > 4 && (
                              <button
                                onClick={() => setActiveTab('photos')}
                                className="aspect-[4/3] rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center"
                              >
                                <span className="text-xl font-bold">
                                  +{galleryImages.length - 4}
                                </span>
                                <span className="text-xs text-gray-500">
                                  More Photos
                                </span>
                              </button>
                            )}
                          </div>
                        </section>
                      )}

                      <section className="border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900">
                            What Our Clients Say
                          </h3>
                          {data.reviews.length > 0 && (
                            <button
                              onClick={() => setActiveTab('reviews')}
                              className="text-sm text-orange-600 font-medium"
                            >
                              View All Reviews
                            </button>
                          )}
                        </div>

                        {data.reviews.length > 0 ? (
                          <div>
                            {(() => {
                              const review = data.reviews[0];
                              const name =
                                review.user?.name ||
                                review.name ||
                                'Customer';
                              return (
                                <>
                                  <div className="flex items-center gap-3">
                                    {review.user?.avatar || review.avatar ? (
                                      <img
                                        src={getImageUrl(
                                          review.user?.avatar || review.avatar,
                                        )}
                                        alt={name}
                                        className="w-10 h-10 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-600">
                                        {name.slice(0, 1).toUpperCase()}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-semibold text-sm text-gray-900">
                                        {name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {review.role || 'Customer'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <StarRating rating={review.rating || 0} />
                                  </div>
                                  <p className="text-sm text-gray-600 leading-6 mt-2">
                                    {review.comment ||
                                      review.review ||
                                      ''}
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No reviews are available yet.
                          </p>
                        )}
                      </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-4 sm:space-y-5">
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
                            const parts = getHoursParts(data.openingHours[day]);
                            return (
                              <div
                                key={day}
                                className="flex items-center justify-between gap-3 text-xs"
                              >
                                <span className="text-gray-600 capitalize">
                                  {day}
                                </span>
                                <span
                                  className={
                                    !parts.isOpen && data.openingHours[day]
                                      ? 'text-red-600 font-medium'
                                      : 'text-gray-800'
                                  }
                                >
                                  {data.openingHours[day]
                                    ? parts.isOpen
                                      ? `${parts.open || '10:00 AM'} - ${parts.close || '7:00 PM'}`
                                      : 'Closed'
                                    : 'Not set'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="h-52 bg-gray-100">
                          <iframe
                            title="Business location"
                            src={`https://www.google.com/maps?q=${encodeURIComponent(
                              String(mapQuery || ''),
                            )}&output=embed`}
                            className="w-full h-full border-0"
                            loading="lazy"
                          />
                        </div>
                        <button
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                String(mapQuery || address),
                              )}`,
                              '_blank',
                            )
                          }
                          className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Icon name="send" className="w-4 h-4" />
                          Get Directions
                        </button>
                      </div>

                      <div className="border border-gray-200 rounded-xl p-5">
                        <h3 className="font-bold text-gray-900 mb-4">
                          Business Information
                        </h3>
                        <div className="space-y-3 text-xs">
                          {business.established_year && (
                            <div className="flex gap-2.5">
                              <Icon name="calendar" className="w-4 h-4 text-gray-400 shrink-0" />
                              <div>
                                <span className="text-gray-500">Year Established: </span>
                                <span className="font-medium text-gray-900">
                                  {business.established_year}
                                </span>
                              </div>
                            </div>
                          )}

                          {business.team_size && (
                            <div className="flex gap-2.5">
                              <Icon name="users" className="w-4 h-4 text-gray-400 shrink-0" />
                              <div>
                                <span className="text-gray-500">Team Size: </span>
                                <span className="font-medium text-gray-900">
                                  {business.team_size}
                                </span>
                              </div>
                            </div>
                          )}

                          {business.payment_options && (
                            <div className="flex gap-2.5">
                              <Icon name="award" className="w-4 h-4 text-gray-400 shrink-0" />
                              <div>
                                <span className="text-gray-500">Payment Options: </span>
                                <span className="font-medium text-gray-900">
                                  {business.payment_options}
                                </span>
                              </div>
                            </div>
                          )}

                          {business.languages && (
                            <div className="flex gap-2.5">
                              <Icon name="globe" className="w-4 h-4 text-gray-400 shrink-0" />
                              <div>
                                <span className="text-gray-500">Languages: </span>
                                <span className="font-medium text-gray-900">
                                  {business.languages}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {Object.keys(data.socialLinks).length > 0 && (
                          <div className="border-t border-gray-200 mt-5 pt-5">
                            <h4 className="font-semibold text-sm text-gray-900 mb-3">
                              Share this Business
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(data.socialLinks).map(
                                ([type, value]: [string, any]) => {
                                  const url =
                                    typeof value === 'string'
                                      ? value
                                      : value?.enabled === false
                                        ? ''
                                        : value?.url;
                                  return (
                                    <SocialIcon
                                      key={type}
                                      type={type}
                                      url={url}
                                    />
                                  );
                                },
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {data.faqs.length > 0 && (
                        <div className="border border-gray-200 rounded-xl p-5">
                          <h3 className="font-bold text-gray-900 mb-4">
                            Frequently Asked Questions
                          </h3>
                          <div className="space-y-3">
                            {data.faqs.slice(0, 5).map((faq: any, i: number) => (
                              <details key={faq.id || i} className="border-b border-gray-100 pb-3">
                                <summary className="cursor-pointer text-sm font-medium text-gray-800">
                                  {faq.question || faq.title || 'Question'}
                                </summary>
                                <p className="text-xs text-gray-500 mt-2 leading-5">
                                  {faq.answer || faq.description || ''}
                                </p>
                              </details>
                            ))}
                          </div>
                        </div>
                      )}
                    </aside>
                  </div>
                )}

                {/* Services */}
                {activeTab === 'services' && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900">
                      All Services
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 mb-5">
                      Services offered by {business.name}.
                    </p>
                    {activeServices.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeServices.map((service: any, i: number) => (
                          <div key={service.id || i} className="border border-gray-200 rounded-xl p-5">
                            <div className="flex gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-xl shrink-0">
                                {service.icon || serviceIcon(service.name || '')}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">
                                  {service.name || 'Service'}
                                </h4>
                                {service.description && (
                                  <p className="text-sm text-gray-600 leading-6 mt-1">
                                    {service.description}
                                  </p>
                                )}
                                {service.price && (
                                  <div className="text-sm font-bold text-orange-600 mt-2">
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

                {/* Photos */}
                {activeTab === 'photos' && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900">Photo Gallery</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-5">
                      Photos uploaded for this business listing.
                    </p>
                    {galleryImages.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryImages.map((image, i) => (
                          <div key={`${image}-${i}`} className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200">
                            <img src={image} alt={`${business.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition" />
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

                {/* Reviews */}
                {activeTab === 'reviews' && (
                  <section>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          See what customers are saying about this business.
                        </p>
                      </div>
                      <StarRating rating={rating} count={reviewCount} />
                    </div>

                    {data.reviews.length ? (
                      <div className="space-y-4">
                        {data.reviews.map((review: any, i: number) => {
                          const name = review.user?.name || review.name || 'Customer';
                          return (
                            <article key={review.id || i} className="border border-gray-200 rounded-xl p-5">
                              <div className="flex items-center gap-3">
                                {review.user?.avatar || review.avatar ? (
                                  <img
                                    src={getImageUrl(review.user?.avatar || review.avatar)}
                                    alt={name}
                                    className="w-11 h-11 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                    {name.slice(0, 1).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-gray-900">{name}</div>
                                  <div className="text-xs text-gray-500">{review.role || 'Customer'}</div>
                                </div>
                              </div>
                              <div className="mt-3">
                                <StarRating rating={review.rating || 0} />
                              </div>
                              <p className="text-sm text-gray-600 leading-6 mt-3">
                                {review.comment || review.review || ''}
                              </p>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-10 border border-dashed border-gray-300 rounded-xl text-center text-gray-500">
                        No reviews are available yet.
                      </div>
                    )}
                  </section>
                )}

                {/* Videos */}
                {activeTab === 'videos' && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900">Business Videos</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-5">
                      Videos associated with this business listing.
                    </p>
                    {data.videos.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {data.videos.map((video: any, i: number) => {
                          const url =
                            typeof video === 'string'
                              ? video
                              : video?.url || video?.video_url || '';
                          const thumbnail = getImageUrl(
                            video?.thumbnail || video?.thumbnail_url,
                          );

                          return (
                            <a
                              key={video?.id || i}
                              href={url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 flex items-center justify-center group"
                            >
                              {thumbnail && (
                                <img
                                  src={thumbnail}
                                  alt={video?.title || 'Business video'}
                                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                                />
                              )}
                              <span className="relative z-10 w-14 h-14 rounded-full bg-white text-orange-600 flex items-center justify-center shadow-lg">
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

export default function PreviewListingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div>}>
      <PreviewListingPageContent />
    </Suspense>
  );
}

