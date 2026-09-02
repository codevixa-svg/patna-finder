'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminBusinessesApi, adminCategoriesApi, adminAreasApi } from '@/lib/adminApi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

function parseJSON(value: any): any {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return null; }
  }
  return value;
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

export default function EditBusinessPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated } = useAdminAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [areas, setAreas] = useState<{ id: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    category_id: '',
    area_id: '',
    status: 'pending',
    phone: '',
    email: '',
    website: '',
    whatsapp: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    landmark: '',
    latitude: '',
    longitude: '',
    short_description: '',
    description: '',
    meta_title: '',
    meta_description: '',
    is_verified: false,
    is_featured: false,
    is_sponsored: false,
    is_trending: false,
    is_popular: false,
    is_hidden_gem: false,
  });

  const [stats, setStats] = useState({
    rating: 0,
    review_count: 0,
    view_count: 0,
    created_at: '',
    updated_at: '',
  });

  const [images, setImages] = useState({
    logo: '',
    cover_image: '',
    featured_image: '',
  });

  const [openingHours, setOpeningHours] = useState<Record<string, any>>({});
  const [services, setServices] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<Record<string, any>>({});
  const [gallery, setGallery] = useState<string[]>([]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) { router.push('/admin/login'); return; }
    loadBusiness();
    loadDropdowns();
  }, [isAuthenticated, router, mounted]);

  async function loadBusiness() {
    try {
      setLoading(true);
      const data = await adminBusinessesApi.getOne(Number(id));
      setFormData({
        name: data.name || '',
        tagline: data.tagline || '',
        category_id: data.category?.id || data.category_id || '',
        area_id: data.area?.id || data.area_id || '',
        status: data.status || 'pending',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        whatsapp: data.whatsapp || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        pincode: data.pincode || '',
        country: data.country || '',
        landmark: data.landmark || '',
        latitude: data.latitude || '',
        longitude: data.longitude || '',
        short_description: data.short_description || '',
        description: data.description || '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        is_verified: data.is_verified || false,
        is_featured: data.is_featured || false,
        is_sponsored: data.is_sponsored || false,
        is_trending: data.is_trending || false,
        is_popular: data.is_popular || false,
        is_hidden_gem: data.is_hidden_gem || false,
      });
      setStats({
        rating: Number(data.rating || 0),
        review_count: Number(data.review_count || 0),
        view_count: Number(data.view_count || 0),
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
      });
      setImages({
        logo: getImageUrl(data.logo) || '',
        cover_image: getImageUrl(data.cover_image) || '',
        featured_image: getImageUrl(data.featured_image) || '',
      });
      setOpeningHours(parseJSON(data.opening_hours) || {});
      setServices(parseJSON(data.services) || []);
      setSocialLinks(parseJSON(data.social_links) || {});
      setGallery(
        Array.isArray(parseJSON(data.gallery))
          ? (parseJSON(data.gallery) as any[]).map((g) => getImageUrl(g)).filter(Boolean) as string[]
          : []
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load business');
    } finally {
      setLoading(false);
    }
  }

  async function loadDropdowns() {
    try {
      const [catRes, areaRes] = await Promise.all([
        adminCategoriesApi.getAll(),
        adminAreasApi.getAll(),
      ]);
      setCategories(catRes.data || catRes || []);
      setAreas(areaRes.data || areaRes || []);
    } catch { /* ignore */ }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminBusinessesApi.update(Number(id), {
        name: formData.name,
        tagline: formData.tagline,
        category_id: formData.category_id || null,
        area_id: formData.area_id || null,
        status: formData.status,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        whatsapp: formData.whatsapp,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        landmark: formData.landmark,
        short_description: formData.short_description,
        description: formData.description,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        is_verified: formData.is_verified,
        is_featured: formData.is_featured,
        is_sponsored: formData.is_sponsored,
        is_trending: formData.is_trending,
        is_popular: formData.is_popular,
        is_hidden_gem: formData.is_hidden_gem,
      });
      router.push(`/admin/businesses/${id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update business');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'location', label: 'Location', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'details', label: 'Details', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'admin', label: 'Admin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="ml-64 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-6 overflow-y-auto mt-16 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading business data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto mt-16">
          {/* Top Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href={`/admin/businesses/${id}`} className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
                </Link>
                <div className="h-6 w-px bg-gray-200" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Edit Business</h1>
                  <p className="text-xs text-gray-500">{formData.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/businesses/${id}`} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </Link>
                <button
                  onClick={() => (document.getElementById('edit-form') as HTMLFormElement | null)?.requestSubmit()}
                  disabled={saving}
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 shadow-sm"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      Saving...
                    </span>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 max-w-6xl mx-auto">
            <form id="edit-form" onSubmit={handleSubmit}>
              {/* Cover Preview */}
              {images.cover_image && (
                <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 h-48 relative">
                  <img src={images.cover_image} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-4 flex items-center gap-3">
                    {images.logo && (
                      <img src={images.logo} alt="Logo" className="w-12 h-12 rounded-lg bg-white shadow-md object-cover border-2 border-white" />
                    )}
                    <div>
                      <p className="text-white font-semibold text-sm">{formData.name}</p>
                      <p className="text-white/70 text-xs">{formData.tagline}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-1.5 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} /></svg>
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  {/* Basic Info Tab */}
                  {activeTab === 'basic' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        Basic Information
                      </h3>
                      <div>
                        <label className={labelClass}>Business Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="Enter business name" />
                      </div>
                      <div>
                        <label className={labelClass}>Tagline</label>
                        <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} className={inputClass} placeholder="A catchy tagline for your business" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Category *</label>
                          <select name="category_id" value={formData.category_id} onChange={handleChange} className={inputClass} required>
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Area *</label>
                          <select name="area_id" value={formData.area_id} onChange={handleChange} className={inputClass} required>
                            <option value="">Select Area</option>
                            {areas.map((area) => (
                              <option key={area.id} value={area.id}>{area.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Short Description</label>
                        <input type="text" name="short_description" value={formData.short_description} onChange={handleChange} maxLength={500} className={inputClass} placeholder="Brief one-liner (max 500 chars)" />
                      </div>
                      <div>
                        <label className={labelClass}>Full Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className={inputClass} placeholder="Detailed description of your business..." />
                      </div>
                    </div>
                  )}

                  {/* Contact Tab */}
                  {activeTab === 'contact' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Phone</label>
                          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="+91 XXXXX XXXXX" />
                        </div>
                        <div>
                          <label className={labelClass}>WhatsApp</label>
                          <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className={inputClass} placeholder="+91 XXXXX XXXXX" />
                        </div>
                        <div>
                          <label className={labelClass}>Email</label>
                          <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="business@example.com" />
                        </div>
                        <div>
                          <label className={labelClass}>Website</label>
                          <input type="url" name="website" value={formData.website} onChange={handleChange} className={inputClass} placeholder="https://example.com" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Location Tab */}
                  {activeTab === 'location' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Location
                      </h3>
                      <div>
                        <label className={labelClass}>Address</label>
                        <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className={inputClass} placeholder="Full address" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>City</label>
                          <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>State</label>
                          <input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClass}>Pincode</label>
                          <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className={inputClass} placeholder="800001" />
                        </div>
                        <div>
                          <label className={labelClass}>Country</label>
                          <input type="text" name="country" value={formData.country} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Landmark</label>
                          <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className={inputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Latitude</label>
                          <input type="text" name="latitude" value={formData.latitude} onChange={handleChange} className={inputClass} placeholder="25.6093" />
                        </div>
                        <div>
                          <label className={labelClass}>Longitude</label>
                          <input type="text" name="longitude" value={formData.longitude} onChange={handleChange} className={inputClass} placeholder="85.1376" />
                        </div>
                      </div>
                      {/* Map Preview */}
                      <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200" style={{ height: '280px' }}>
                        {(() => {
                          const hasLatLng = formData.latitude && formData.longitude;
                          const hasAddress = formData.address || formData.city;
                          const mapQuery = hasLatLng
                            ? `${formData.latitude},${formData.longitude}`
                            : hasAddress
                              ? [formData.address, formData.landmark, formData.city, formData.state, formData.pincode].filter(Boolean).join(', ')
                              : '';
                          return mapQuery ? (
                            <iframe
                              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                              className="w-full h-full"
                              style={{ border: 0 }}
                              loading="lazy"
                              title="Business Location Map"
                            />
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <p className="text-sm font-medium">No location data available</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <>
                      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          SEO & Description
                        </h3>
                        <div>
                          <label className={labelClass}>Meta Title</label>
                          <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} className={inputClass} placeholder="SEO title for search engines" />
                        </div>
                        <div>
                          <label className={labelClass}>Meta Description</label>
                          <textarea name="meta_description" value={formData.meta_description} onChange={handleChange} rows={3} className={inputClass} placeholder="SEO description for search engines" />
                        </div>
                      </div>

                      {/* Read-only: Opening Hours */}
                      {openingHours && Object.keys(openingHours).length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Opening Hours
                            <span className="text-xs font-normal text-gray-400 ml-1">(read-only)</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(openingHours).map(([day, hours]: [string, any]) => (
                              <div key={day} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                                <span className="text-sm text-gray-500">
                                  {hours && (hours.is_open === false || hours.closed === true) ? 'Closed' : `${hours?.open_time || hours?.open || '—'} - ${hours?.close_time || hours?.close || '—'}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Read-only: Services */}
                      {services.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                            Services
                            <span className="text-xs font-normal text-gray-400 ml-1">(read-only)</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {services.map((s: any, i: number) => (
                              <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <p className="text-sm font-medium text-gray-900">{typeof s === 'string' ? s : s.name || 'Service'}</p>
                                {typeof s === 'object' && s?.price && <p className="text-xs text-green-600 font-semibold mt-0.5">&#8377;{s.price}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Read-only: Social Links */}
                      {socialLinks && Object.keys(socialLinks).length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            Social Links
                            <span className="text-xs font-normal text-gray-400 ml-1">(read-only)</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(socialLinks).map(([platform, val]: [string, any]) => {
                              const url = typeof val === 'object' && val !== null ? val.url : val;
                              if (!url) return null;
                              return (
                                <div key={platform} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-gray-600 uppercase">{platform.charAt(0)}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 capitalize">{platform}</p>
                                    <p className="text-xs text-gray-500 truncate">{url}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Read-only: Gallery */}
                      {gallery.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Gallery
                            <span className="text-xs font-normal text-gray-400 ml-1">({gallery.length} photos, read-only)</span>
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {gallery.map((src, i) => (
                              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Admin Tab */}
                  {activeTab === 'admin' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Admin Controls
                      </h3>
                      <div>
                        <label className={labelClass}>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </div>
                      <div className="pt-2">
                        <label className={labelClass}>Flags</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          {([
                            { name: 'is_verified', label: 'Verified', color: 'blue' },
                            { name: 'is_featured', label: 'Featured', color: 'yellow' },
                            { name: 'is_sponsored', label: 'Sponsored', color: 'purple' },
                            { name: 'is_trending', label: 'Trending', color: 'orange' },
                            { name: 'is_popular', label: 'Popular', color: 'green' },
                            { name: 'is_hidden_gem', label: 'Hidden Gem', color: 'pink' },
                          ] as const).map((flag) => (
                            <label key={flag.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 transition">
                              <input
                                type="checkbox"
                                name={flag.name}
                                checked={formData[flag.name]}
                                onChange={handleCheckbox}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">{flag.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Rating</span>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          <span className="text-sm font-semibold text-gray-900">{Number(stats.rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Reviews</span>
                        <span className="text-sm font-semibold text-gray-900">{stats.review_count || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Views</span>
                        <span className="text-sm font-semibold text-gray-900">{stats.view_count || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Images</h3>
                    <div className="space-y-3">
                      {images.logo && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Logo</p>
                          <img src={images.logo} alt="Logo" className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                        </div>
                      )}
                      {images.featured_image && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Featured</p>
                          <img src={images.featured_image} alt="Featured" className="w-full h-24 rounded-lg object-cover border border-gray-200" />
                        </div>
                      )}
                      {!images.logo && !images.featured_image && !images.cover_image && (
                        <p className="text-xs text-gray-400">No images uploaded</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Timestamps</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-400">Created</p>
                        <p className="text-sm text-gray-700">{stats.created_at ? new Date(stats.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Updated</p>
                        <p className="text-sm text-gray-700">{stats.updated_at ? new Date(stats.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
