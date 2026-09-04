'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminBlogApi, adminBlogCategoriesApi } from '@/lib/adminApi';
import BlockEditor, { ImageSourceInput } from '@/components/admin/BlockEditor';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function EditBlogPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isAuthenticated } = useAdminAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    image_alt: '',
    author_name: '',
    author_bio: '',
    reading_time: '',
    category: '',
    tags: '',
    status: 'draft',
    published_at: '',
    meta_title: '',
    meta_description: '',
  });
  const [sidebarData, setSidebarData] = useState({
    slug: '',
    view_count: 0,
    created_at: '',
    updated_at: '',
  });
  const [categories, setCategories] = useState<string[]>(['News', 'Events', 'Guides', 'Festivals', 'Lifestyle', 'Food', 'Education', 'Tourism']);
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    setAddingCategory(true);
    try {
      await adminBlogCategoriesApi.create({ name });
      setCategories((prev) => Array.from(new Set([...prev, name])));
      setFormData((prev: any) => ({ ...prev, category: name }));
      setNewCategory('');
      alert(`Category "${name}" added successfully!`);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Load admin-managed blog categories for the dropdown
    adminBlogCategoriesApi
      .getAll()
      .then((res: any) => {
        const names = (Array.isArray(res) ? res : []).map((c: any) => c.name).filter(Boolean);
        if (names.length > 0) setCategories(names);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }
    fetchPost();
  }, [isAuthenticated, router, mounted]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await adminBlogApi.getOne(Number(id));
      setFormData({
        title: data.title || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        featured_image: data.featured_image || '',
        image_alt: data.image_alt || '',
        author_name: data.author_name || '',
        author_bio: data.author_bio || '',
        reading_time: data.reading_time ? String(data.reading_time) : '',
        category: data.category || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
        status: data.status || 'draft',
        published_at: data.published_at
          ? new Date(data.published_at).toISOString().slice(0, 16)
          : '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
      });
      setSidebarData({
        slug: data.slug || '',
        view_count: data.view_count || 0,
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
      });
    } catch (error) {
      console.error('Failed to fetch post:', error);
      alert('Failed to load blog post');
      router.push('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        reading_time: formData.reading_time ? Number(formData.reading_time) : null,
        published_at: formData.published_at || null,
      };
      await adminBlogApi.update(Number(id), payload);
      alert('Blog post updated successfully!');
      router.push('/admin/blog');
    } catch (error: any) {
      console.error('Failed to update post:', error);
      alert(error.response?.data?.message || 'Failed to update blog post');
    } finally {
      setSaving(false);
    }
  };

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
      <div className="ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-y-auto mt-16">
          <button
            onClick={() => router.push('/admin/blog')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            &larr; Back to Blog
          </button>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter post title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                      <textarea
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        maxLength={1000}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Short description"
                      />
                      <p className="text-xs text-gray-400 mt-1">{formData.excerpt.length}/1000</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                      <p className="text-xs text-gray-500 mb-2">
                        Build the article with template blocks — cards, lists, buttons, badges, images & more. Every block has a live preview.
                      </p>
                      <BlockEditor
                        value={formData.content}
                        onChange={(html: string) => setFormData({ ...formData, content: html })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                        <input
                          type="text"
                          name="author_name"
                          value={formData.author_name}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Author name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">— Select category —</option>
                          {Array.from(new Set([formData.category, ...categories].filter(Boolean))).map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <div className="mt-2 flex gap-2">
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New category name…"
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={handleAddCategory}
                            disabled={addingCategory || !newCategory.trim()}
                            className="whitespace-nowrap px-3 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                          >
                            {addingCategory ? 'Adding…' : '+ Add Category'}
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">New category database me save hoti hai aur dono forms me turant dikhne lagti hai.</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Separate tags with commas"
                      />
                      <p className="text-xs text-gray-400 mt-1">Separate multiple tags with commas</p>
                    </div>

                    <div>
                      <ImageSourceInput
                        label="Featured Image (URL or upload)"
                        value={formData.featured_image}
                        onChange={(url: string) => setFormData({ ...formData, featured_image: url })}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Google Discover: min <strong>1200px wide</strong> high-quality image (16:9 / 4:3 / 1:1)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
                      <input
                        type="text"
                        name="image_alt"
                        value={formData.image_alt}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe the image for accessibility & image SEO"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Author Bio (E-E-A-T)</label>
                        <textarea
                          name="author_bio"
                          value={formData.author_bio}
                          onChange={handleChange}
                          rows={2}
                          maxLength={1000}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Short author bio for Google Discover trust signals"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reading Time (minutes)</label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          name="reading_time"
                          value={formData.reading_time}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g. 5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Published At</label>
                        <input
                          type="datetime-local"
                          name="published_at"
                          value={formData.published_at}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">SEO Settings</h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                        <input
                          type="text"
                          name="meta_title"
                          value={formData.meta_title}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="SEO title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                        <textarea
                          name="meta_description"
                          value={formData.meta_description}
                          onChange={handleChange}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="SEO description"
                        />
                      </div>
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
                        onClick={() => router.push('/admin/blog')}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Post Info</h3>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-gray-500">Slug</dt>
                      <dd className="text-gray-900 font-mono break-all">{sidebarData.slug || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Views</dt>
                      <dd className="text-gray-900">{sidebarData.view_count.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Created At</dt>
                      <dd className="text-gray-900">
                        {sidebarData.created_at
                          ? new Date(sidebarData.created_at).toLocaleString()
                          : '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Updated At</dt>
                      <dd className="text-gray-900">
                        {sidebarData.updated_at
                          ? new Date(sidebarData.updated_at).toLocaleString()
                          : '-'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
