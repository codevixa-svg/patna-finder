'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userBusinessApi } from '@/lib/userApi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import toast from 'react-hot-toast';

function EditBusinessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessId = searchParams.get('id');
  const { isAuthenticated } = useUserAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    short_description: '',
    tagline: '',
    phone: '',
    email: '',
    website: '',
    whatsapp: '',
    address: '',
    city: 'Patna',
    state: 'Bihar',
    pincode: '',
    landmark: '',
    category_id: '',
    area_id: '',
    latitude: '',
    longitude: '',
    google_map_location: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/dashboard/login');
      return;
    }
    if (businessId) {
      fetchBusiness();
      fetchCategoriesAndAreas();
    }
  }, [isAuthenticated, mounted, businessId]);

  const fetchCategoriesAndAreas = async () => {
    try {
      const [catRes, areaRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/categories`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/areas`),
      ]);
      const catData = await catRes.json();
      const areaData = await areaRes.json();
      setCategories(Array.isArray(catData) ? catData : catData.data || []);
      setAreas(Array.isArray(areaData) ? areaData : areaData.data || []);
    } catch (e) {
      console.error('Failed to load categories/areas');
    }
  };

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const response = await userBusinessApi.getOne(Number(businessId));
      const business = response.data;
      setFormData({
        name: business.name || '',
        description: business.description || '',
        short_description: business.short_description || '',
        tagline: business.tagline || '',
        phone: business.phone || '',
        email: business.email || '',
        website: business.website || '',
        whatsapp: business.whatsapp || '',
        address: business.address || '',
        city: business.city || 'Patna',
        state: business.state || 'Bihar',
        pincode: business.pincode || '',
        landmark: business.landmark || '',
        category_id: business.category_id || '',
        area_id: business.area_id || '',
        latitude: business.latitude || '',
        longitude: business.longitude || '',
        google_map_location: business.google_map_location || '',
      });
    } catch (error) {
      console.error('Failed to fetch business:', error);
      toast.error('Failed to load business details');
      router.push('/dashboard/businesses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userBusinessApi.update(Number(businessId), formData);
      toast.success('Business updated successfully!');
      router.push('/dashboard/businesses');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.response?.data?.errors?.name?.[0] || 'Failed to update business';
      toast.error(msg);
    } finally {
      setSaving(false);
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
    <DashboardLayout
      pageTitle="Edit Business"
      pageSubtitle={loading ? 'Loading...' : formData.name}
      showSaveButton={!loading}
      onSaveClick={() => {
        const form = document.getElementById('edit-form') as HTMLFormElement | null;
        form?.requestSubmit();
      }}
      saveButtonText={saving ? 'Saving...' : 'Save Changes'}
      loading={saving}
    >
      <div className="p-4 sm:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <form id="edit-form" onSubmit={handleSubmit} className="max-w-4xl space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="A short catchy tagline"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => handleChange('category_id', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area *</label>
                    <select
                      value={formData.area_id}
                      onChange={(e) => handleChange('area_id', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="">Select area</option>
                      {areas.map((area: any) => (
                        <option key={area.id} value={area.id}>{area.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => handleChange('short_description', e.target.value)}
                    maxLength={500}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Brief description (max 500 chars)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Detailed description of your business"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange('whatsapp', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleChange('pincode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => handleChange('landmark', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => handleChange('latitude', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="25.6093"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => handleChange('longitude', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="85.1376"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.google_map_location}
                    onChange={(e) => handleChange('google_map_location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                {/* Map Preview */}
                <div className="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-300" style={{ height: '280px' }}>
                  {(() => {
                    const hasLatLng = formData.latitude && formData.longitude;
                    const hasAddress = formData.address || formData.city;
                    const hasMapUrl = formData.google_map_location;
                    const mapQuery = (() => {
                      if (hasMapUrl) {
                        try {
                          const url = new URL(hasMapUrl.startsWith('http') ? hasMapUrl : `https://${hasMapUrl}`);
                          const q = url.searchParams.get('q');
                          if (q) return q;
                          const ll = url.searchParams.get('ll');
                          if (ll) return ll;
                          const query = url.searchParams.get('query');
                          if (query) return query;
                        } catch {
                          if (/^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*$/.test(hasMapUrl.trim())) return hasMapUrl.trim();
                          return hasMapUrl;
                        }
                      }
                      if (hasLatLng) return `${formData.latitude},${formData.longitude}`;
                      if (hasAddress) return [formData.address, formData.landmark, formData.city, formData.state, formData.pincode].filter(Boolean).join(', ');
                      return '';
                    })();

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
                        <p className="text-sm font-medium">No location data</p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Business'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/businesses')}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function EditBusinessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div>}>
      <EditBusinessPageContent />
    </Suspense>
  );
}

