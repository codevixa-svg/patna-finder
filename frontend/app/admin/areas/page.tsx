'use client';

import toast from 'react-hot-toast';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminAreasApi, adminMediaApi } from '@/lib/adminApi';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

// Base URL without the /api/v1 suffix — used to build storage image URLs
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '');

// Build an absolute image URL from backend storage paths (/storage/...)
const buildImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith('/storage/')) return `${API_BASE_URL}${path}`;
  if (path.startsWith('storage/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

interface Area {
  id: number;
  name: string;
  slug: string;
  description?: string;
  banner_image?: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  businesses_count?: number;
  created_at: string;
}

const defaultFormData = {
  name: '',
  description: '',
  banner_image: '',
  latitude: '',
  longitude: '',
  is_active: true,
};

export default function AreasPage() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuthStore();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<Area | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    fetchAreas();
  }, [isAuthenticated, router, mounted]);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const data = await adminAreasApi.getAll({});
      setAreas(data.data || []);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAreas = areas.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = areas.filter(a => a.is_active).length;

  const openCreateModal = () => {
    setFormData(defaultFormData);
    setShowCreateModal(true);
  };

  const openEditModal = (area: Area) => {
    setEditData(area);
    setFormData({
      name: area.name,
      description: area.description || '',
      banner_image: area.banner_image || '',
      latitude: area.latitude?.toString() || '',
      longitude: area.longitude?.toString() || '',
      is_active: area.is_active,
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditData(null);
    setFormData(defaultFormData);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      const payload: any = { name: formData.name.trim() };
      if (formData.description) payload.description = formData.description;
      payload.banner_image = formData.banner_image?.trim() || null;
      if (formData.latitude) payload.latitude = parseFloat(formData.latitude);
      if (formData.longitude) payload.longitude = parseFloat(formData.longitude);
      payload.is_active = formData.is_active;
      await adminAreasApi.create(payload);
      toast.success('Area created successfully');
      closeModals();
      fetchAreas();
    } catch (error) {
      console.error('Failed to create area:', error);
      toast.error('Failed to create area');
    }
  };

  const handleUpdate = async () => {
    if (!editData) return;
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    try {
      const payload: any = { name: formData.name.trim() };
      if (formData.description) payload.description = formData.description;
      payload.banner_image = formData.banner_image?.trim() || null;
      if (formData.latitude) payload.latitude = parseFloat(formData.latitude);
      if (formData.longitude) payload.longitude = parseFloat(formData.longitude);
      payload.is_active = formData.is_active;
      await adminAreasApi.update(editData.id, payload);
      toast.success('Area updated successfully');
      closeModals();
      fetchAreas();
    } catch (error) {
      console.error('Failed to update area:', error);
      toast.error('Failed to update area');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this area?')) return;
    try {
      await adminAreasApi.delete(id);
      toast.success('Area deleted successfully');
      fetchAreas();
    } catch (error) {
      console.error('Failed to delete area:', error);
      toast.error('Failed to delete area');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await adminAreasApi.toggleActive(id);
      fetchAreas();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      toast.error('Failed to toggle active status');
    }
  };

  const handleBannerFileSelect = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    const toastId = toast.loading('Uploading image...');
    setBannerUploading(true);
    adminMediaApi
      .upload(file)
      .then((res: { url: string }) => {
        setFormData((prev) => ({ ...prev, banner_image: res.url }));
        toast.success('Image uploaded!', { id: toastId });
      })
      .catch((err) => {
        console.error('Failed to upload banner image:', err);
        toast.error('Image upload failed', { id: toastId });
      })
      .finally(() => {
        setBannerUploading(false);
        if (bannerFileRef.current) bannerFileRef.current.value = '';
      });
  };

  const AreaFormModal = ({ isEdit }: { isEdit: boolean }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Area' : 'Create Area'}
          </h2>
          <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Area name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
            <div className="flex items-center gap-3">
              {buildImageUrl(formData.banner_image) ? (
                <img
                  src={buildImageUrl(formData.banner_image)!}
                  alt="Banner preview"
                  className="h-14 w-24 rounded-lg border border-gray-300 object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-14 w-24 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => bannerFileRef.current?.click()}
                  disabled={bannerUploading}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {bannerUploading ? 'Uploading…' : 'Upload Image'}
                </button>
                {formData.banner_image && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, banner_image: '' }))}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                ref={bannerFileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleBannerFileSelect(e.target.files?.[0])}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG or WebP, max 5MB. Shown on the All Areas page.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="25.6093"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="85.1376"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Active</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.is_active ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.is_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={closeModals}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={isEdit ? handleUpdate : handleCreate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            {isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="lg:ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Areas</h1>
              <p className="text-gray-600 text-sm mt-1">Manage Patna areas</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Area
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">Total Areas</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">{areas.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">Active</div>
              <div className="mt-1 text-2xl font-bold text-[#062B49]">{activeCount}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">Inactive</div>
              <div className="mt-1 text-2xl font-bold text-red-600">{areas.length - activeCount}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <input
              type="search"
              placeholder="Search areas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredAreas.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No areas found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new area.</p>
              </div>
            ) : (
              <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Businesses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAreas.map((area) => (
                    <tr key={area.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {buildImageUrl(area.banner_image) ? (
                            <img
                              src={buildImageUrl(area.banner_image)!}
                              alt={area.name}
                              className="flex-shrink-0 h-10 w-10 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{area.name}</div>
                            <div className="text-sm text-gray-500">{area.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{area.businesses_count ?? 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(area.id)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition ${
                            area.is_active
                              ? 'bg-[#FFF4CC] text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {area.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {area.latitude && area.longitude
                            ? `${area.latitude.toFixed(4)}, ${area.longitude.toFixed(4)}`
                            : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {new Date(area.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(area)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(area.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            )}
          </div>
        </main>
      </div>

      {showCreateModal && <AreaFormModal isEdit={false} />}
      {showEditModal && <AreaFormModal isEdit={true} />}
    </div>
  );
}
