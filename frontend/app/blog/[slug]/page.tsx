import { api } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post;
  
  try {
    post = await api.getBlogPost(slug);
  } catch (error) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link href="/blog" className="text-amber-500 hover:text-amber-600 font-semibold">
            ← Back to Blog
          </Link>
        </div>

        <div className="card">
          {/* Category & Date */}
          <div className="flex items-center gap-4 mb-6">
            <span className="px-4 py-2 bg-amber-400 text-gray-900 rounded-lg font-bold">
              {post.category}
            </span>
            <span className="text-gray-500">
              {new Date(post.published_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="text-gray-500">• {post.view_count} views</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {post.author_name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-gray-900">{post.author_name}</div>
              <div className="text-sm text-gray-500">Author</div>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="relative h-96 -mx-6 mb-8 overflow-hidden rounded-2xl">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">Share this article:</span>
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition">
                  f
                </button>
                <button className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition">
                  t
                </button>
                <button className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition">
                  W
                </button>
                <button className="w-10 h-10 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition">
                  🔗
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">You might also like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Placeholder for related posts */}
          <div className="card">
            <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
            <h3 className="font-bold text-lg">Related Article 1</h3>
            <p className="text-sm text-gray-600 mt-2">Coming soon...</p>
          </div>
          <div className="card">
            <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
            <h3 className="font-bold text-lg">Related Article 2</h3>
            <p className="text-sm text-gray-600 mt-2">Coming soon...</p>
          </div>
          <div className="card">
            <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
            <h3 className="font-bold text-lg">Related Article 3</h3>
            <p className="text-sm text-gray-600 mt-2">Coming soon...</p>
          </div>
        </div>
      </section>
    </main>
  );
}
