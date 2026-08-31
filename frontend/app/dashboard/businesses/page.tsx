'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userBusinessApi } from '@/lib/userApi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const BACKEND_URL = API_BASE_URL.replace('/api/v1', '');

const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('/storage/')) {
    return `${BACKEND_URL}${imagePath}`;
  }
  if (imagePath.startsWith('storage/')) {
    return `${BACKEND_URL}/${imagePath}`;
  }
  return imagePath;
};

export default function MyBusinessesPage() {
  const router = useRouter();
  const { isAuthenticated } = useUserAuthStore();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/dashboard/login');
      return;
    }
    fetchBusinesses();
  }, [isAuthenticated, router, mounted]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await userBusinessApi.getAll();
      setBusinesses(response.data || []);
      if (response.data && response.data.length > 0) {
        toast.success(`${response.data.length} business${response.data.length > 1 ? 'es' : ''} loaded`);
      }
    } catch (error: any) {
      console.error('Failed to fetch businesses:', error);
      toast.error('Failed to load businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this business?')) return;

    const toastId = toast.loading('Deleting business...');
    try {
      await userBusinessApi.delete(id);
      toast.success('Business deleted successfully!', { id: toastId });
      fetchBusinesses();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete business', { id: toastId });
    }
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <DashboardLayout
        pageTitle="My Businesses"
        pageSubtitle="Manage all your business listings"
        showSaveButton={false}
      >
        <div className="p-4 sm:p-5 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 lg:py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-orange-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading your businesses...</p>
              </div>
            </div>
          ) : businesses.length === 0 ? (
            <div className="bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-200">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No businesses yet</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
                Get started by adding your first business listing
              </p>
              <Link
                href="/dashboard/add-business"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition text-sm sm:text-base"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Business
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Top Section with Image */}
                  <div className="relative h-36 sm:h-44 lg:h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {(business.cover_image || business.featured_image) ? (
                      <img
                        src={getImageUrl(business.cover_image || business.featured_image)}
                        alt={business.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                      <span className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded text-xs font-bold uppercase ${
                        business.status === 'approved' ? 'bg-green-500 text-white' :
                        business.status === 'pending' ? 'bg-yellow-400 text-gray-900' :
                        'bg-red-500 text-white'
                      }`}>
                        {business.status}
                      </span>
                    </div>

                    {/* Logo - Bottom Left Overlap */}
                    <div className="absolute -bottom-8 sm:-bottom-10 lg:-bottom-12 left-4 sm:left-6 lg:left-8">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-xl sm:rounded-2xl border-3 sm:border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                        {business.logo ? (
                          <img
                            src={getImageUrl(business.logo)}
                            alt="Logo"
                            className="w-full h-full object-contain p-1 sm:p-2"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-center">
                            <div className="text-base sm:text-lg lg:text-2xl font-bold text-gray-700">
                              {business.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="text-[9px] sm:text-[10px] lg:text-xs text-gray-500 uppercase tracking-wide">
                              {business.category?.name.substring(0, 10) || 'Business'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section with Details */}
                  <div className="pt-10 sm:pt-12 lg:pt-16 pb-4 sm:pb-5 lg:pb-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                            {business.name}
                          </h3>
                          {business.is_verified && (
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        {business.category && (
                          <p className="text-blue-600 font-medium text-xs sm:text-sm mb-1.5 sm:mb-2">
                            {business.category.name}
                          </p>
                        )}

                        {business.is_verified && (
                          <div className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-50 text-green-700 rounded text-xs font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center flex-wrap gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-5 lg:mb-6">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-bold text-gray-900 text-sm">{business.rating || '0.00'}</span>
                        <span className="text-gray-500 text-xs sm:text-sm">({business.review_count || 0})</span>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-xs sm:text-sm">{business.view_count || 0}</span>
                      </div>

                      {business.area && (
                        <div className="flex items-center gap-1 sm:gap-1.5 text-gray-600">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-xs sm:text-sm truncate">{business.area.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-5 lg:mb-6">
                      {business.phone && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 min-w-0">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="truncate">+91 {business.phone}</span>
                        </div>
                      )}

                      {business.email && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 min-w-0">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{business.email}</span>
                        </div>
                      )}

                      {business.website && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 min-w-0">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          <span className="truncate">{business.website}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <Link
                        href={`/dashboard/add-business?id=${business.id}`}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>

                      <button
                        onClick={() => router.push(`/dashboard/preview/${business.id}`)}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold rounded-lg hover:bg-gray-200 transition"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>

                      <button
                        onClick={() => handleDelete(business.id)}
                        className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 bg-red-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-red-700 transition"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
}
