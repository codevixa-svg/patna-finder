'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userDashboardApi } from '@/lib/userApi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useUserAuthStore();
  const [stats, setStats] = useState<any>(null);
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
    fetchStats();
  }, [isAuthenticated, router, mounted]);

  const fetchStats = async () => {
    try {
      const data = await userDashboardApi.getQuickStats();
      setStats(data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      pageTitle="Dashboard"
      pageSubtitle={`Welcome back, ${user?.name}!`}
      showSaveButton={false}
    >
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Total Businesses</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.businesses?.total || 0}</p>
            <p className="text-xs sm:text-sm text-green-600 mt-1.5 sm:mt-2">
              {stats?.businesses?.approved || 0} approved
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Total Views</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.total_views || 0}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 sm:mt-2">All time views</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
            <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Total Reviews</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.total_reviews || 0}</p>
            <p className="text-xs sm:text-sm text-amber-600 mt-1.5 sm:mt-2">
              ⭐ {stats?.average_rating || 0} avg rating
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">Pending</h3>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{stats?.businesses?.pending || 0}</p>
            <p className="text-xs sm:text-sm text-orange-600 mt-1.5 sm:mt-2">Awaiting approval</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Link
                href="/dashboard/add-business"
                className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-center group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-xs sm:text-sm">Add Business</p>
              </Link>

              <Link
                href="/dashboard/businesses"
                className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-xs sm:text-sm">View Listings</p>
              </Link>

              <Link
                href="/dashboard/profile"
                className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition text-center group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-xs sm:text-sm">Edit Profile</p>
              </Link>

              <Link
                href="/dashboard/billing"
                className="p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-center group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="font-semibold text-gray-900 text-xs sm:text-sm">Billing</p>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 sm:p-6 shadow-lg text-white">
            <h2 className="text-lg sm:text-xl font-bold mb-2">🚀 Boost Your Visibility!</h2>
            <p className="text-orange-100 text-sm mb-4">
              Upgrade to Premium and get featured on homepage, priority support, and detailed analytics.
            </p>
            <button className="bg-white text-orange-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-orange-50 transition text-sm">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
