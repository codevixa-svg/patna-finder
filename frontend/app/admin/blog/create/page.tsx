'use client';

import toast from 'react-hot-toast';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { adminBlogApi, adminBlogCategoriesApi } from '@/lib/adminApi';
import { slugify, sanitizeSlugInput } from '@/lib/slug';
import { ImageSourceInput } from '@/components/admin/BlockEditor';
import CkEditor from '@/components/admin/ckeditor/CkEditor';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function CreateBlogPage() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>(['News', 'Events', 'Guides', 'Festivals', 'Lifestyle', 'Food', 'Education', 'Tourism']);
  const [newCategory, setNewCategory] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  // Once the admin edits the slug manually we stop auto-generating it
  const [slugEdited, setSlugEdited] = useState(false);

  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    setAddingCategory(true);
    try {
      await adminBlogCategoriesApi.create({ name });
      setCategories((prev) => Array.from(new Set([...prev, name])));
      setFormData((prev: any) => ({ ...prev, category: name }));
      setNewCategory('');
      toast.success(`Category "${name}" added successfully!`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft',
    featured_image: '',
    image_alt: '',
    author_name: '',
    author_bio: '',
    reading_time: '',
    category: 'News',
    tags: '',
    meta_title: '',
    meta_description: '',
  });

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
    }
  }, [isAuthenticated, router, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminBlogApi.create({
        ...formData,
        // Empty slug = let the backend auto-generate it from the title
        // (with automatic -2, -3… suffixes if a duplicate exists)
        slug: slugEdited ? formData.slug : '',
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        reading_time: formData.reading_time ? Number(formData.reading_time) : null,
      });
      toast.success('Blog post created successfully!');
      router.push('/admin/blog');
    } catch (error: any) {
      console.error('Failed to create post:', error);
      const data = error.response?.data;
      const detail = data?.errors ? Object.values(data.errors).flat().join(' ') : '';
      toast.error(detail ? `${data?.message || 'Validation failed'} ${detail}` : data?.message || 'Failed to create blog post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Title keystrokes keep the slug in sync until the admin customises it
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: slugEdited ? prev.slug : slugify(title),
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true);
    const clean = sanitizeSlugInput(e.target.value);
    setFormData((prev) => ({ ...prev, slug: clean }));
  };

  const handleSlugBlur = () => {
    setFormData((prev) => ({ ...prev, slug: slugify(prev.slug) }));
  };

  // Go back to auto mode: slug follows the title again
  const handleRegenerateSlug = () => {
    setSlugEdited(false);
    setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
  };

  if (!mounted || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-y-auto mt-16">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Blog Post</h1>
            <p className="text-gray-600 text-sm mt-1">Write a new blog post</p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">URL Slug</label>
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    className="text-xs font-medium text-green-600 hover:text-green-700"
                    title="Regenerate the slug from the current title"
                  >
                    ↻ Auto-generate from title
                  </button>
                </div>
                <div className="flex items-stretch rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent overflow-hidden">
                  <span className="flex items-center pl-3 pr-1 text-sm text-gray-400 whitespace-nowrap select-none">
                    /blog/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    onBlur={handleSlugBlur}
                    maxLength={80}
                    className="flex-1 min-w-0 py-2 pr-3 text-sm font-mono text-gray-800 focus:outline-none"
                    placeholder="auto-generated-from-title"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {slugEdited
                    ? 'Custom URL — it will be saved exactly as typed.'
                    : 'Auto-generated from the title — edit it to use a custom URL.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Short description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <p className="text-xs text-gray-500 mb-2">
                  Write with CKEditor — rich formatting, theme Blocks (boxes, quotes, CTA…) and full
                  article Templates. Images upload straight to the server.
                </p>
                <CkEditor
                  value={formData.content}
                  onChange={(html: string) => setFormData({ ...formData, content: html })}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Featured Image & Author</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Google Discover tip: large high-quality image (min <strong>1200px wide</strong>, 16:9 / 4:3 / 1:1) + descriptive alt text.
                </p>
                <div className="space-y-4">
                  <ImageSourceInput
                    label="Featured Image (URL or upload — min 1200px wide)"
                    value={formData.featured_image}
                    onChange={(url: string) => setFormData({ ...formData, featured_image: url })}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Alt Text</label>
                    <input
                      type="text"
                      name="image_alt"
                      value={formData.image_alt}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Describe the image for accessibility & image SEO"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                      <input
                        type="text"
                        name="author_name"
                        value={formData.author_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Author full name"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author Bio (E-E-A-T)</label>
                    <textarea
                      name="author_bio"
                      value={formData.author_bio}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Short author bio — builds Experience, Expertise, Authoritativeness & Trust for Google Discover"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="New category name…"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="patna, bihar, news (comma separated)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">SEO & Google Discover Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="SEO description"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Post'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
