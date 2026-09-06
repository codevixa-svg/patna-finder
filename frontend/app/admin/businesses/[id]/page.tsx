'use client';

import toast from 'react-hot-toast';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminBusinessesApi } from '@/lib/adminApi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface Business {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  tagline: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  logo: string;
  cover_image: string;
  featured_image: string;
  established_year: number;
  landmark: string;
  category: { id: string; name: string };
  area: { id: string; name: string };
  user: { id: string; name: string; email: string };
  status: string;
  rating: number;
  review_count: number;
  view_count: number;
  is_verified: boolean;
  is_featured: boolean;
  is_sponsored: boolean;
  is_trending: boolean;
  is_popular: boolean;
  opening_hours: Record<string, { open: string; close: string; open_time?: string; close_time?: string; closed?: boolean; is_open?: boolean }> | null;
  services: any[];
  gallery: any[];
  social_links: Record<string, any> | null;
  amenities: any[];
  created_at: string;
  updated_at: string;
}

function parseJSON(value: any): any {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return null; }
  }
  return value;
}

export default function AdminBusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { isAuthenticated } = useAdminAuthStore();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { window.location.href = '/admin/login'; return; }
    fetchBusiness();
  }, [isAuthenticated, id]);

  async function fetchBusiness() {
    try {
      setLoading(true);
      setError('');
      const data = await adminBusinessesApi.getOne(Number(id));
      setBusiness({
        ...data,
        rating: Number(data.rating || 0),
        view_count: Number(data.view_count || 0),
        review_count: Number(data.review_count || 0),
        opening_hours: parseJSON(data.opening_hours),
        gallery: parseJSON(data.gallery),
        social_links: parseJSON(data.social_links),
        services: parseJSON(data.services),
        videos: parseJSON(data.videos),
        amenities: parseJSON(data.amenities),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load business');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: string) {
    try {
      const numId = Number(id);
      if (action === 'approve') { await adminBusinessesApi.approve(numId); }
      else if (action === 'reject') { await adminBusinessesApi.reject(numId); }
      else if (action === 'feature') { await adminBusinessesApi.feature(numId); }
      else if (action === 'verify') { await adminBusinessesApi.verify(numId); }
      else if (action === 'toggle-trending') { await adminBusinessesApi.toggleTrending(numId); }
      else if (action === 'toggle-sponsored') { await adminBusinessesApi.toggleSponsored(numId); }
      else if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this business?')) return;
        await adminBusinessesApi.delete(numId);
        router.push('/admin/businesses');
        return;
      }
      fetchBusiness();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    }
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      suspended: 'bg-gray-100 text-gray-800 border-gray-200',
      draft: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  function getImageUrl(src: any): string | null {
    if (!src) return null;
    const url = typeof src === 'string' ? src : src.src || src.url || null;
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const base = API_BASE.replace(/\/api\/v1\/?$/, '');
    return base + (url.startsWith('/') ? url : '/' + url);
  }

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="ml-64 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-y-auto mt-16 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-500 text-sm">Loading business details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="ml-64 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-y-auto mt-16">
            <Link href="/admin/businesses" className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Businesses
            </Link>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
              <p className="text-red-700 font-medium">{error || 'Business not found'}</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const coverUrl = getImageUrl(business.cover_image);
  const logoUrl = getImageUrl(business.logo);
  const featuredUrl = getImageUrl(business.featured_image);
  const galleryImages = Array.isArray(business.gallery)
    ? business.gallery.map(g => getImageUrl(g)).filter(Boolean) as string[]
    : [];
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto mt-16">

          {/* Cover Image / Hero */}
          <div className="relative h-64 bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden">
            {coverUrl ? (
              <img src={coverUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Back button */}
            <Link href="/admin/businesses" className="absolute top-4 left-6 text-white/80 hover:text-white text-sm font-medium inline-flex items-center gap-1 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </Link>

            {/* Business name overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end gap-5 max-w-5xl">
                {logoUrl ? (
                  <div className="w-20 h-20 rounded-xl bg-white shadow-lg overflow-hidden flex-shrink-0 border-2 border-white">
                    <img src={logoUrl} alt={business.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg flex items-center justify-center flex-shrink-0 border-2 border-white/30">
                    <svg className="w-10 h-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                )}
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 mb-1">
                    {statusBadge(business.status)}
                    {business.is_verified && <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-semibold">Verified</span>}
                    {business.is_featured && <span className="px-2 py-0.5 bg-yellow-500 text-white rounded text-xs font-semibold">Featured</span>}
                  </div>
                  <h1 className="text-2xl font-bold text-white truncate">{business.name}</h1>
                  {business.tagline && <p className="text-white/70 text-sm mt-0.5 truncate">{business.tagline}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 max-w-6xl mx-auto space-y-6">

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{Number(business.rating || 0).toFixed(1)}</p>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(Number(business.rating || 0)) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{business.review_count || 0} reviews</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{business.view_count || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Total Views</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-sm font-semibold text-gray-900">{business.category?.name || 'N/A'}</p>
                <p className="text-xs text-gray-400 mt-1">Category</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-sm font-semibold text-gray-900">{business.area?.name || 'N/A'}</p>
                <p className="text-xs text-gray-400 mt-1">Area</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex flex-wrap items-center gap-2">
                {business.status === 'pending' && (
                  <>
                    <button onClick={() => handleAction('approve')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Approve
                    </button>
                    <button onClick={() => handleAction('reject')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleAction('feature')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition ${business.is_featured ? 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {business.is_featured ? '★' : '☆'} Featured
                </button>
                <button
                  onClick={() => handleAction('verify')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition ${business.is_verified ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {business.is_verified ? '✓' : '○'} Verified
                </button>
                <button
                  onClick={() => handleAction('toggle-trending')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition ${business.is_trending ? 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {business.is_trending ? '🔥' : '○'} Trending
                </button>
                <button
                  onClick={() => handleAction('toggle-sponsored')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition ${business.is_sponsored ? 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {business.is_sponsored ? '◆' : '◇'} Sponsored
                </button>
                <div className="flex-1" />
                <button onClick={() => router.push(`/admin/businesses/${id}/edit`)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit
                </button>
                <button onClick={() => handleAction('delete')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete
                </button>
              </div>
            </div>

            {/* Featured Image */}
            {featuredUrl && (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                  <h2 className="text-sm font-semibold text-gray-900">Featured Image</h2>
                </div>
                <div className="p-4">
                  <img src={featuredUrl} alt="Featured" className="w-full h-64 object-cover rounded-lg" />
                </div>
              </div>
            )}

            {/* Description + Owner side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                {(business.description || business.short_description) && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3">About this business</h2>
                    {business.short_description && (
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">{business.short_description}</p>
                    )}
                    {business.description && (
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{business.description}</p>
                    )}
                  </div>
                )}

                {/* Contact & Location */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-sm font-semibold text-gray-900 mb-4">Contact & Location</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {business.phone && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Phone</p>
                          <p className="text-sm text-gray-900 font-medium">{business.phone}</p>
                        </div>
                      </div>
                    )}
                    {business.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Email</p>
                          <p className="text-sm text-gray-900 font-medium">{business.email}</p>
                        </div>
                      </div>
                    )}
                    {business.whatsapp && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">WhatsApp</p>
                          <p className="text-sm text-gray-900 font-medium">{business.whatsapp}</p>
                        </div>
                      </div>
                    )}
                    {business.website && (
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Website</p>
                          <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-medium truncate block max-w-[180px]">{business.website}</a>
                        </div>
                      </div>
                    )}
                    {business.address && (
                      <div className="flex items-start gap-3 sm:col-span-2">
                        <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Address</p>
                          <p className="text-sm text-gray-900 font-medium">
                            {business.address}
                            {business.landmark && `, ${business.landmark}`}
                            {business.city && `, ${business.city}`}
                            {business.state && `, ${business.state}`}
                            {business.pincode && ` - ${business.pincode}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Opening Hours */}
                {business.opening_hours && typeof business.opening_hours === 'object' && Object.keys(business.opening_hours).length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Opening Hours</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(business.opening_hours).map(([day, hours]: [string, any]) => {
                        if (typeof hours !== 'object' || hours === null) return null;
                        const isClosed = hours.is_open === false || hours.closed === true;
                        const isOpen = today === day && !isClosed;
                        const openT = hours.open_time || hours.open;
                        const closeT = hours.close_time || hours.close;
                        return (
                          <div key={day} className={`flex items-center justify-between p-3 rounded-lg ${isOpen ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-100'}`}>
                            <span className={`text-sm font-medium ${isOpen ? 'text-green-700' : 'text-gray-700'}`}>
                              {day.charAt(0).toUpperCase() + day.slice(1)}
                              {isOpen && <span className="ml-2 text-xs text-green-600">Today</span>}
                            </span>
                            <span className={`text-sm ${isClosed ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                              {isClosed ? 'Closed' : (openT && closeT ? `${openT} - ${closeT}` : '—')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Owner */}
                {business.user && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3">Owner</h2>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {business.user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{business.user.name}</p>
                        <p className="text-xs text-gray-500">{business.user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meta / Dates */}
                <div className="bg-white rounded-xl border border-gray-100 p-6">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Details</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created</span>
                      <span className="text-gray-900 font-medium">{new Date(business.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Updated</span>
                      <span className="text-gray-900 font-medium">{new Date(business.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    {business.established_year && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Established</span>
                        <span className="text-gray-900 font-medium">{business.established_year}</span>
                      </div>
                    )}
                    {business.latitude && business.longitude && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Coordinates</span>
                        <span className="text-gray-900 font-mono text-xs">{Number(business.latitude).toFixed(4)}, {Number(business.longitude).toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                {business.amenities && Array.isArray(business.amenities) && business.amenities.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h2>
                    <div className="flex flex-wrap gap-2">
                      {business.amenities.map((a: any, i: number) => (
                        <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                          {typeof a === 'string' ? a : a.name || 'Amenity'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Services */}
            {business.services && Array.isArray(business.services) && business.services.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {business.services.map((service: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {typeof service === 'string' ? service : service.name || 'Service'}
                      </p>
                      {typeof service === 'object' && service?.description && (
                        <p className="text-xs text-gray-500 mt-1">{service.description}</p>
                      )}
                      {typeof service === 'object' && service?.price && (
                        <p className="text-xs text-green-600 font-semibold mt-1">&#8377;{service.price}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {business.social_links && typeof business.social_links === 'object' && Object.keys(business.social_links).length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Social Links</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(business.social_links).map(([platform, val]) => {
                    const url = typeof val === 'object' && val !== null ? val.url : val;
                    const enabled = typeof val === 'object' && val !== null ? val.enabled : true;
                    if (!url) return null;
                    const icons: Record<string, string> = {
                      facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
                      instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
                      twitter: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
                      youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
                      linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
                    };
                    return (
                      <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                        className={`flex items-center gap-3 p-3 rounded-lg border transition ${enabled ? 'border-gray-100 hover:bg-gray-50' : 'border-gray-100 opacity-40'}`}>
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d={icons[platform.toLowerCase()] || ''} /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 capitalize">{platform}</p>
                          <p className="text-xs text-gray-500 truncate">{url}</p>
                        </div>
                        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-4">Gallery ({galleryImages.length} photos)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {galleryImages.map((src, index) => (
                    <button key={index} onClick={() => setLightbox(src)} className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-blue-400 transition">
                      <img src={src} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={lightbox} alt="Gallery" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
