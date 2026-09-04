import { api } from '@/lib/api';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Patna Pulse - Blog',
  description: 'Latest news, stories, guides, festivals & events from Patna, Bihar — Patna Pulse by Patna Finder.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Patna Pulse - Blog',
    description: 'Latest news, stories, guides, festivals & events from Patna, Bihar.',
    type: 'website',
  },
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const posts = await api.getBlogPosts(category ? { category, per_page: 24 } : { per_page: 24 });

  // Dynamic admin-managed categories (fallback to defaults)
  const fallbackCategories = ['News', 'Events', 'Guides', 'Festivals', 'Lifestyle', 'Food', 'Education', 'Tourism'];
  let blogCategories = fallbackCategories;
  try {
    const cats = await api.getBlogCategories();
    const names = (Array.isArray(cats) ? cats : []).map((c: any) => c.name).filter(Boolean);
    if (names.length > 0) blogCategories = names;
  } catch {}

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Patna Pulse 📰</h1>
          <p className="text-xl text-gray-300">Your source for local news, stories, guides & events</p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/blog"
              className={`px-6 py-3 rounded-xl font-semibold transition ${!category ? 'bg-amber-400 text-gray-900' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
            >
              All Posts
            </Link>
            {blogCategories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className={`px-6 py-3 rounded-xl font-semibold transition ${category === cat ? 'bg-amber-400 text-gray-900' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.data && posts.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.data.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="card group">
                <div className="relative h-48 -m-6 mb-4 overflow-hidden rounded-t-[20px] bg-gray-100">
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                      <span className="text-6xl">📰</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-amber-400 text-gray-900 text-xs font-bold rounded-lg">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-500 transition line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                    <span>By {post.author_name}</span>
                    <span>{new Date(post.published_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No blog posts yet</h3>
            <p className="text-gray-600">Check back soon for latest updates from Patna!</p>
          </div>
        )}
      </section>
    </main>
  );
}
