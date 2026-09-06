import { api } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { format } from 'date-fns';
import {
  Calendar,
  ChevronRight,
  Clock,
  Flame,
  Home,
  Newspaper,
  Send,
  Tag,
} from 'lucide-react';
import TableOfContents from './TableOfContents';
import SaveForLaterButton from './SaveForLaterButton';
import NewsletterForm from '../NewsletterForm';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const SITE_NAME = 'Patna Finder';

function formatDate(value?: string) {
  if (!value) return '';
  try {
    return format(new Date(value), 'd MMM yyyy');
  } catch {
    return '';
  }
}

function readTime(post: any) {
  if (post.reading_time) return `${post.reading_time} min read`;
  const words = String(post.content || '')
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

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

// Brand SVG icons for share buttons (lucide has no brand icons)
const SHARE_PATHS = {
  whatsapp:
    'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z',
  facebook:
    'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
};

function BrandIcon({ path, className }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

/** Same card style as the blog listing page, for "You May Also Like". */
function PostCard({ post }: { post: any }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative h-36 overflow-hidden bg-amber-50">
          {post.featured_image ? (
            <img
              src={post.featured_image}
              alt={post.image_alt || post.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 text-amber-300">
              <Newspaper size={36} />
            </div>
          )}
          {post.category && (
            <span className="absolute left-3 top-3 rounded-md bg-amber-400 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm">
              {post.category}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="mb-1.5 line-clamp-2 text-base font-bold leading-snug text-gray-900 transition group-hover:text-amber-600">
            {post.title}
          </h3>
          <p className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={12} /> {formatDate(post.published_at)}
            <span aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {readTime(post)}
            </span>
          </p>
        </div>
      </Link>
    </article>
  );
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const tags: string[] = Array.isArray(post.tags) ? post.tags : [];
  const publishedIso = post.published_at ? new Date(post.published_at).toISOString() : '';
  const updatedIso = post.updated_at ? new Date(post.updated_at).toISOString() : publishedIso;
  const showUpdated = Boolean(updatedIso && publishedIso && updatedIso !== publishedIso);
  const readingTime = readTime(post);
  const authorName = post.author_name || `${SITE_NAME} Team`;

  // Related posts (same category, excluding current) — sidebar + bottom grid
  let related: any[] = [];
  try {
    const res = await api.getBlogPosts({ category: post.category, per_page: 12 });
    const items = Array.isArray(res) ? res : res.data || [];
    related = items.filter((p: any) => p?.slug !== post.slug);
  } catch {}
  const sidebarRelated = related.slice(0, 4);
  const alsoLikeRaw = related.slice(4, 8);
  const alsoLike = alsoLikeRaw.length > 0 ? alsoLikeRaw : related.slice(0, 4);

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
    author: { '@type': 'Person', name: authorName },
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
      { '@type': 'ListItem', position: 2, name: 'Blogs', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  };

  return (
    <main className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <ol className="flex items-center gap-1.5 text-sm text-gray-500">
          <li>
            <Link href="/" className="inline-flex items-center gap-1.5 transition hover:text-amber-600">
              <Home size={14} /> Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} className="text-gray-300" />
          </li>
          <li>
            <Link href="/blog" className="transition hover:text-amber-600">
              Blogs
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} className="text-gray-300" />
          </li>
          <li className="line-clamp-1 max-w-[380px] font-medium text-gray-800">{post.title}</li>
        </ol>
      </nav>

      {/* ── Article + sidebar ── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="min-w-0">
            {/* Hero image with category badge + save button */}
            <div className="relative h-64 overflow-hidden rounded-2xl bg-amber-50 sm:h-80 lg:h-[420px]">
              {post.featured_image ? (
                <img
                  src={post.featured_image}
                  alt={post.image_alt || post.title}
                  loading="eager"
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 text-amber-300">
                  <Newspaper size={64} />
                </div>
              )}
              {post.category && (
                <Link
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="absolute left-4 top-4 rounded-full bg-amber-400 px-3.5 py-1.5 text-xs font-semibold text-gray-900 shadow-md transition hover:bg-amber-500"
                >
                  {post.category}
                </Link>
              )}
              <div className="absolute right-4 top-4">
                <SaveForLaterButton slug={post.slug} />
              </div>
            </div>

            {/* Title + excerpt */}
            <h1 className="mt-8 text-3xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-4xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-4 text-lg leading-relaxed text-gray-600">{post.excerpt}</p>
            )}

            {/* Author + meta */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b border-gray-100 pb-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-sm font-bold text-gray-900">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">By {authorName}</p>
                    <p className="text-xs text-gray-500">Contributor</p>
                  </div>
                </div>
                <span aria-hidden="true" className="hidden h-8 w-px bg-gray-100 sm:block" />
                <p className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Calendar size={15} className="text-amber-500" />
                  <time dateTime={publishedIso}>{formatDate(post.published_at)}</time>
                  {showUpdated && (
                    <span className="text-xs text-gray-400"> (updated {formatDate(post.updated_at)})</span>
                  )}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Clock size={15} className="text-amber-500" /> {readingTime}
                </p>
                {post.category && (
                  <Link
                    href={`/blog?category=${encodeURIComponent(post.category)}`}
                    className="flex items-center gap-1.5 text-sm text-gray-600 transition hover:text-amber-600"
                  >
                    <Tag size={15} className="text-amber-500" /> {post.category}
                  </Link>
                )}
              </div>

              {/* Share */}
              <div className="flex items-center gap-2.5">
                <span className="mr-1 text-sm font-medium text-gray-500">Share</span>
                <a
                  href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:opacity-85"
                >
                  <BrandIcon path={SHARE_PATHS.whatsapp} className="h-4 w-4" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2] text-white transition hover:opacity-85"
                >
                  <BrandIcon path={SHARE_PATHS.facebook} className="h-4 w-4" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X (Twitter)"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F0F0F] text-white transition hover:opacity-85"
                >
                  <BrandIcon path={SHARE_PATHS.x} className="h-3.5 w-3.5" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A66C2] text-white transition hover:opacity-85"
                >
                  <BrandIcon path={SHARE_PATHS.linkedin} className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Article body — typography scoped in globals.css (.blog-content) */}
            <div className="blog-content mt-8" dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* Author box — E-E-A-T trust signal */}
            <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-lg font-bold text-gray-900">
                {authorName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900">{authorName}</p>
                <p className="text-xs text-gray-500">Contributor · {SITE_NAME}</p>
                {post.author_bio && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{post.author_bio}</p>
                )}
              </div>
              <Link
                href="/blog"
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-amber-500"
              >
                View all posts
              </Link>
            </div>
          </article>

          {/* ── Sidebar — sticky on desktop; height grows with content (not fixed) ── */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <TableOfContents />

            {/* Related Blogs */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <Flame size={18} className="text-amber-500" /> Related Blogs
              </h3>
              <div className="space-y-4">
                {sidebarRelated.map((p: any) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="group flex gap-3">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-amber-50">
                      {p.featured_image ? (
                        <img
                          src={p.featured_image}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-amber-300">
                          <Newspaper size={18} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition group-hover:text-amber-600">
                        {p.title}
                      </h4>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                        <span>{formatDate(p.published_at)}</span>
                        <span aria-hidden="true">•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} /> {readTime(p)}
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}
                {sidebarRelated.length === 0 && (
                  <p className="text-sm text-gray-400">No related posts yet.</p>
                )}
              </div>
            </div>

            {/* Newsletter — light amber card */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-amber-500 shadow-sm">
                <Send size={18} />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">Get Latest Blogs &amp; Updates</h3>
              <p className="mb-4 mt-1.5 text-sm leading-relaxed text-gray-600">
                Stay informed with the latest stories, local insights and exclusive updates from Patna.
              </p>
              <NewsletterForm />
              <p className="mt-4 text-right text-sm font-semibold italic text-amber-700">
                Explore Patna →
              </p>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                  <Tag size={18} className="text-amber-500" /> Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <Link
                      key={t}
                      href={`/blog?tag=${encodeURIComponent(t)}`}
                      className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:border-amber-400 hover:text-amber-600"
                    >
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* ── You May Also Like ── */}
      <section className="mx-auto max-w-7xl border-t border-gray-100 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">You May Also Like</h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-amber-700 transition hover:text-amber-800"
          >
            View All <ChevronRight size={16} />
          </Link>
        </div>
        {alsoLike.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {alsoLike.map((p: any) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">More stories coming soon — browse all blogs.</p>
        )}
      </section>
    </main>
  );
}







