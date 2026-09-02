'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUserAuthStore } from '@/store/userAuthStore';
import { userUpdateApi, userBusinessApi } from '@/lib/userApi';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const BACKEND_URL = API_BASE_URL.replace('/api/v1', '');

const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('/storage/')) return `${BACKEND_URL}${imagePath}`;
  if (imagePath.startsWith('storage/')) return `${BACKEND_URL}/${imagePath}`;
  return imagePath;
};

const CTA_TYPES = [
  { value: 'learn_more', label: 'Learn More' },
  { value: 'call', label: 'Call Now' },
  { value: 'book', label: 'Book Now' },
  { value: 'order', label: 'Order Now' },
  { value: 'visit', label: 'Visit Store' },
];

function EditUpdatePageContent() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useUserAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState('');
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    cta_text: '',
    cta_url: '',
    cta_type: 'learn_more',
    is_active: true,
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
    fetchData();
  }, [isAuthenticated, mounted]);

  const fetchData = async () => {
    try {
      const [businessesRes, updateRes] = await Promise.all([
        userBusinessApi.getAll(),
        userUpdateApi.getOne(Number(params.id)),
      ]);
      setBusinesses(businessesRes.data || []);
      const update = updateRes.data;
      setBusinessId(update.business_id || null);
      setFormData({
        title: update.title || '',
        content: update.content || '',
        image: update.image || '',
        cta_text: update.cta_text || '',
        cta_url: update.cta_url || '',
        cta_type: update.cta_type || 'learn_more',
        is_active: update.is_active ?? true,
      });
      if (update.image) setImagePreview(getImageUrl(update.image));
    } catch {
      toast.error('Failed to load update');
      router.push('/dashboard/updates');
    }
  };

  const currentBusiness = businesses.find((b) => b.id === businessId);

  // Auto-fill CTA URL from already-saved business contact details:
  // "Call Now" -> business phone number, other types -> business website
  const handleCtaTypeChange = (newType: string) => {
    const business = businesses.find((b) => b.id === businessId);
    let autoUrl = '';
    let defaultText = '';
    if (newType === 'call') {
      autoUrl = business?.phone || business?.alternate_phone || business?.whatsapp || '';
      defaultText = 'Call Now';
    } else {
      if (business?.website) {
        const site = String(business.website);
        autoUrl = /^https?:\/\//i.test(site) ? site : `https://${site}`;
      }
      defaultText = CTA_TYPES.find((t) => t.value === newType)?.label || '';
    }
    setFormData({
      ...formData,
      cta_type: newType,
      cta_url: autoUrl || '',
      cta_text: formData.cta_text || defaultText,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    const reader = new FileReader();
    reader.onloadend = async () => {
      const result = reader.result as string;
      setImagePreview(result);
      try {
        const uploadResponse = await userUpdateApi.uploadImage(result);
        if (uploadResponse.success) {
          setFormData({ ...formData, image: uploadResponse.url });
          toast.success('Image uploaded!', { id: toastId });
        } else {
          toast.error('Upload failed', { id: toastId });
        }
      } catch {
        toast.error('Upload failed', { id: toastId });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error('Please enter content');
      return;
    }
    try {
      setLoading(true);
      await userUpdateApi.update(Number(params.id), formData);
      toast.success('Update saved successfully!');
      router.push('/dashboard/updates');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.values(errors).forEach((err: any) => toast.error(Array.isArray(err) ? err[0] : err));
      } else {
        toast.error(error.response?.data?.message || 'Failed to save update');
      }
    } finally {
      setLoading(false);
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
    <DashboardLayout pageTitle="Edit Update" pageSubtitle="Edit your update" showSaveButton={false}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Image (optional)</label>
            <div className="mt-2">
              {imagePreview ? (
                <div className="relative aspect-video w-full max-w-md">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => { setImagePreview(''); setFormData({ ...formData, image: '' }); }} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video max-w-md border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition">
                  <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-sm text-gray-500">Click to upload image</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title (optional)</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Special Offer This Week!" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" maxLength={255} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Write your update here..." rows={5} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none" maxLength={5000} required />
              <p className="text-xs text-gray-400 mt-1">{formData.content.length}/5000</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Call-to-Action Button (optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Button Type</label>
                <select value={formData.cta_type} onChange={(e) => handleCtaTypeChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500">
                  {CTA_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Button Text</label>
                <input type="text" value={formData.cta_text} onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })} placeholder="Learn More" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500" maxLength={100} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Button URL</label>
                <input
                  type={formData.cta_type === 'call' ? 'tel' : 'url'}
                  value={formData.cta_url}
                  onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  placeholder={formData.cta_type === 'call' ? 'Auto-filled from business phone' : 'https://...'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  {formData.cta_type === 'call'
                    ? currentBusiness?.phone || currentBusiness?.alternate_phone || currentBusiness?.whatsapp
                      ? '✓ Auto-filled from business contact details'
                      : 'Business has no phone number saved'
                    : currentBusiness?.website
                      ? '✓ Auto-filled from business website (editable)'
                      : 'Business has no website saved'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500" />
              <div>
                <span className="text-sm font-medium text-gray-700">Active</span>
                <p className="text-xs text-gray-500">Make this update visible to customers</p>
              </div>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => router.push('/dashboard/updates')} className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">Cancel</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function EditUpdatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div></div>}>
      <EditUpdatePageContent />
    </Suspense>
  );
}