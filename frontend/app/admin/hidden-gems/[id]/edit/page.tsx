'use client';

import toast from 'react-hot-toast';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminHiddenGemsApi, adminCategoriesApi, adminAreasApi } from '@/lib/adminApi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface HiddenGem {
  id: number;
  title: string;
  slug: string;
  category_id: number | null;
  area_id: number | null;
  category: { id: number; name: string } | null;
  area: { id: number; name: string } | null;
  story: string;
  address: string;
  latitude: string;
  longitude: string;
  featured_image: string;
  gallery: string[];
  badge: string;
  tags: string[];
  view_count: number;
  like_count: number;
  share_count: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  meta_title: string;
  meta_description: string;
  created_at: string;
}

interface SelectOption {
  id: number;
  name: string;
}

export default function EditHiddenGemPage() {
  const params = useParams();
  const id = Number(params.id);
  const router = useRouter();
  const { isAuthenticated } = useAdminAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gem, setGem] = useState<HiddenGem | null>(null);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [areas, setAreas] = useState<SelectOption[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    area_id: '',
    story: '',
    address: '',
    latitude: '',
    longitude: '',
    featured_image: '',
    gallery: '',
    badge: '',
    tags: '',
    display_order: 0,
    meta_title: '',
    meta_description: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router, mounted]);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [gemData, catRes, areaRes] = await Promise.all([
          adminHiddenGemsApi.getOne(Number(id)),
          adminCategoriesApi.getAll(),
          adminAreasApi.getAll(),
        ]);

        setGem(gemData);
        setCategories(catRes.data || []);
        setAreas(areaRes.data || []);

        setFormData({
          title: gemData.title || '',
          category_id: gemData.category_id ? String(gemData.category_id) : '',
          area_id: gemData.area_id ? String(gemData.area_id) : '',
          story: gemData.story || '',
          address: gemData.address || '',
          latitude: gemData.latitude || '',
          longitude: gemData.longitude || '',
          featured_image: gemData.featured_image || '',
          gallery: Array.isArray(gemData.gallery) ? gemData.gallery.join('\n') : '',
          badge: gemData.badge || '',
          tags: Array.isArray(gemData.tags) ? gemData.tags.join(', ') : '',
          display_order: gemData.display_order || 0,
          meta_title: gemData.meta_title || '',
          meta_description: gemData.meta_description || '',
        });
      } catch (error: any) {
        console.error('Failed to load:', error);
        toast.error('Failed to load hidden gem data');
        router.push('/admin/hidden-gems');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, mounted, isAuthenticated, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      category_id: formData.category_id ? Number(formData.category_id) : null,
      area_id: formData.area_id ? Number(formData.area_id) : null,
      gallery: formData.gallery
        ? formData.gallery.split('\n').map((u) => u.trim()).filter(Boolean)
        : [],
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    };

    setSaving(true);
    try {
      await adminHiddenGemsApi.update(Number(id), payload);
      toast.success('Hidden gem updated successfully!');
      router.push('/admin/hidden-gems');
    } catch (error: any) {
      console.error('Failed to update:', error);
      toast.error(error.response?.data?.message || 'Failed to update hidden gem');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFeatured = async () => {
    try {
      const res = await adminHiddenGemsApi.feature(Number(id));
      setGem((prev) => (prev ? { ...prev, is_featured: res.is_featured ?? !prev.is_featured } : prev));
      toast.error('Featured status toggled');
    } catch (error: any) {
      toast.error('Failed to toggle featured');
    }
  };

  const handleToggleActive = async () => {
    try {
      const res = await adminHiddenGemsApi.toggleActive(Number(id));
      setGem((prev) => (prev ? { ...prev, is_active: res.is_active ?? !prev.is_active } : prev));
      toast.error('Active status toggled');
    } catch (error: any) {
      toast.error('Failed to toggle active');
    }
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <main className="flex-1 p-6 overflow-y-auto mt-16">
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin/hidden-gems')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2"
            >
              ← Back to Hidden Gems
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Hidden Gem</h1>
                <p className="text-gray-600 text-sm mt-1">{gem?.title}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    gem?.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {gem?.is_active ? 'Active' : 'Inactive'}
                </span>
                {gem?.is_featured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                    Featured
                  </span>
                )}
                <button
                  onClick={handleToggleActive}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Toggle Active
                </button>
                <button
                  onClick={handleToggleFeatured}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Toggle Featured
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-6 max-w-6xl">
            <div className="flex-1">
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter gem title"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                      <select
                        name="area_id"
                        value={formData.area_id}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select area</option>
                        {areas.map((area) => (
                          <option key={area.id} value={area.id}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Story *</label>
                    <textarea
                      name="story"
                      value={formData.story}
                      onChange={handleChange}
                      required
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write the story behind this hidden gem..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <input
                        type="text"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="25.5941"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <input
                        type="text"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="85.1376"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
                    <input
                      type="text"
                      name="featured_image"
                      value={formData.featured_image}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gallery URLs</label>
                    <textarea
                      name="gallery"
                      value={formData.gallery}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder={"https://example.com/img1.jpg\nhttps://example.com/img2.jpg"}
                    />
                    <p className="text-xs text-gray-500 mt-1">One URL per line</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                    <input
                      type="text"
                      name="badge"
                      value={formData.badge}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Hidden Gem, Must Visit"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="history, culture, heritage"
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma separated</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      type="number"
                      name="display_order"
                      value={formData.display_order}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SEO meta title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SEO meta description"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/admin/hidden-gems')}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 sticky top-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Details</h3>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Slug</label>
                  <p className="text-sm text-gray-900 break-all">{gem?.slug || '—'}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Views</label>
                  <p className="text-sm text-gray-900">{gem?.view_count?.toLocaleString() ?? 0}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Likes</label>
                  <p className="text-sm text-gray-900">{gem?.like_count?.toLocaleString() ?? 0}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Shares</label>
                  <p className="text-sm text-gray-900">{gem?.share_count?.toLocaleString() ?? 0}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Created</label>
                  <p className="text-sm text-gray-900">
                    {gem?.created_at
                      ? new Date(gem.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
