import { api } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SITE_NAME = 'Patna Finder';

async function getPost(slug: string) {
  try {
    return await api.getBlogPost(slug);
  } catch {
    return null;
  }
}

// Google Discover: unique, accurate, non-clickbait title + description + article OG tags
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const title = post.meta_title || post.title;
  const description =
    post.meta_description || post.excerpt || `${post.title} — read the latest from ${SITE_NAME}.`;
  const image = post.featured_image || undefined;
  const publishedTime = post.published_at ? new Date(post.published_at).toISOString() : undefined;
  const modifiedTime = post.updated_at ? new Date(post.updated_at).toISOString() : publishedTime;
  const tags: string[] = Array.isArray(post.tags) ? post.tags : [];

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title,
      description,
      url: `/blog/${post.slug}`,
      siteName: SITE_NAME,
      locale: 'en_IN',
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: post.image_alt || post.title }]
        : undefined,
      publishedTime,
      modifiedTime,
      authors: post.author_name ? [post.author_name] : undefined,
      section: post.category || undefined,
      tags: tags.length > 0 ? tags : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    // Discover requirement: allow Google to show large image previews
    robots: {
      googleBot: { 'max-image-preview': 'large' },
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const tags: string[] = Array.isArray(post.tags) ? post.tags : [];
  const publishedIso = post.published_at ? new Date(post.published_at).toISOString() : '';
  const updatedIso = post.updated_at ? new Date(post.updated_at).toISOString() : publishedIso;
  const publishedLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const updatedLabel = post.updated_at
    ? new Date(post.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const showUpdated = Boolean(updatedIso && publishedIso && updatedIso !== publishedIso);
  const wordCount = String(post.content || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  const readingTime = post.reading_time
    ? `${post.reading_time} min read`
    : `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  // Real related posts (same category, excluding current)
  let relatedPosts: any[] = [];
  try {
    const res = await api.getBlogPosts({ category: post.category, per_page: 6 });
    const items = Array.isArray(res) ? res : res.data || [];
    relatedPosts = items.filter((p: any) => p.slug !== post.slug).slice(0, 3);
  } catch {}

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const shareUrl = encodeURIComponent(postUrl);
  const shareTitle = encodeURIComponent(post.title);

  // Google Discover / Rich Results: BlogPosting structured data
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt || '',
    image: post.featured_image ? [post.featured_image] : undefined,
    datePublished: publishedIso || undefined,
    dateModified: updatedIso || undefined,
    author: { '@type': 'Person', name: post.author_name || `${SITE_NAME} Team` },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    articleSection: post.category,
    keywords: tags.join(', '),
    inLanguage: 'en-IN',
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb — internal linking for crawlers */}
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-amber-600">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{post.category}</span>
        </nav>
        <div className="card">
          {/* Category, visible byline date & reading time — Discover signals */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Link
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              className="px-4 py-2 bg-amber-400 text-gray-900 rounded-lg font-bold hover:bg-amber-500 transition"
            >
              {post.category}
            </Link>
            <time dateTime={publishedIso} className="text-gray-500">
              {publishedLabel}
            </time>
            {showUpdated && (
              <span className="text-gray-400 text-sm">
                Updated <time dateTime={updatedIso}>{updatedLabel}</time>
              </span>
            )}
            <span className="text-gray-500">• {readingTime}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {(post.author_name || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-gray-900">{post.author_name || `${SITE_NAME} Team`}</div>
              <div className="text-sm text-gray-500">Author • {SITE_NAME}</div>
            </div>
          </div>

          {/* Featured Image — optimized via next/image, descriptive alt */}
          {post.featured_image && (
            <div className="relative h-96 -mx-6 mb-8 overflow-hidden rounded-2xl">
              <Image
                src={post.featured_image}
                alt={post.image_alt || post.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, i: number) => (
                  <span key={i} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio — E-E-A-T trust signal for Google Discover */}
          {post.author_bio && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-start gap-4 bg-amber-50 rounded-xl p-5">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {(post.author_name || 'P').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900 mb-1">
                    About {post.author_name || `${SITE_NAME} Team`}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{post.author_bio}</p>
                </div>
              </div>
            </div>
          )}

          {/* Share — real share URLs (social signals help discovery) */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-bold text-gray-900">Share this article:</span>
              <div className="flex gap-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Facebook"
                  className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition font-bold text-sm"
                >
                  f
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X (Twitter)"
                  className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition font-bold text-sm"
                >
                  X
                </a>
                <a
                  href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on WhatsApp"
                  className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition font-bold text-sm"
                >
                  W
                </a>
                <a
                  href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Telegram"
                  className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition font-bold text-sm"
                >
                  T
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts — real posts from the same category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">You might also like</h2>
        {relatedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((rel: any) => (
              <Link key={rel.id} href={`/blog/${rel.slug}`} className="card group">
                <div className="relative h-48 -m-6 mb-4 overflow-hidden rounded-t-[20px] bg-gray-100">
                  {rel.featured_image ? (
                    <Image
                      src={rel.featured_image}
                      alt={rel.image_alt || rel.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                      <span className="text-6xl">📰</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg group-hover:text-amber-500 transition line-clamp-2">{rel.title}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{rel.excerpt}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/blog" className="card text-center py-8 hover:border-amber-400 transition">
              <span className="text-4xl">📰</span>
              <h3 className="font-bold text-lg mt-3">More from Patna Pulse</h3>
              <p className="text-sm text-gray-600 mt-1">Browse all articles</p>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
