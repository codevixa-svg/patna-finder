'use client';

import toast from 'react-hot-toast';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminHiddenGemsApi } from '@/lib/adminApi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function HiddenGemsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuthStore();
  const [gems, setGems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    fetchGems();
  }, [isAuthenticated, router, mounted]);

  const fetchGems = async () => {
    try {
      setLoading(true);
      const data = await adminHiddenGemsApi.getAll();
      setGems(data.data || []);
    } catch (error) {
      console.error('Failed to fetch hidden gems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this hidden gem?')) return;
    try {
      await adminHiddenGemsApi.delete(id);
      fetchGems();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete hidden gem');
    }
  };

  const handleSyncGmb = async (id: number) => {
    try {
      await adminHiddenGemsApi.syncGmb(id);
      toast.success('GMB data synced successfully!');
      fetchGems();
    } catch (error) {
      console.error('Failed to sync GMB:', error);
      toast.error('Failed to sync GMB data');
    }
  };

  if (!mounted || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-y-auto mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hidden Gems</h1>
              <p className="text-gray-600 text-sm mt-1">Manage hidden gems of Patna</p>
            </div>
            <button
              onClick={() => router.push('/admin/hidden-gems/create')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Hidden Gem
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : gems.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hidden gems</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new hidden gem.</p>
              </div>
            ) : (
              gems.map((gem) => (
                <div key={gem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition">
                  <div className="relative h-48">
                    {gem.featured_image ? (
                      <img src={gem.featured_image} alt={gem.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-200 to-purple-300 flex items-center justify-center">
                        <svg className="w-16 h-16 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {gem.is_featured && (
                      <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{gem.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{gem.story}</p>
                    
                    {gem.gmb_rating && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-bold text-gray-900">{gem.gmb_rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">({gem.gmb_review_count} reviews)</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <span>👁️ {gem.view_count || 0} views</span>
                      <span>❤️ {gem.like_count || 0} likes</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/hidden-gems/${gem.id}/edit`)}
                        className="flex-1 px-3 py-1.5 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleSyncGmb(gem.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                        title="Sync GMB"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(gem.id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
