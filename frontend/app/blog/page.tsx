import { api } from '@/lib/api';
import Link from 'next/link';
import type { Metadata } from 'next';
import { format } from 'date-fns';
import {
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Flag,
  GraduationCap,
  Home,
  Landmark,
  LayoutGrid,
  MapPin,
  Newspaper,
  Plane,
  Send,
  TrendingUp,
} from 'lucide-react';
import BlogSortSelect from './BlogSortSelect';
import NewsletterForm from './NewsletterForm';

export const metadata: Metadata = {
  title: 'Blogs & Articles',
  description:
    'Discover stories, updates, and useful information about Patna, Bihar and beyond. Explore our latest articles, guides and insights.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blogs & Articles',
    description: 'Latest articles, guides and insights from Patna, Bihar.',
    type: 'website',
  },
};

const PER_PAGE = 9;

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

const CATEGORY_ICONS: [RegExp, any][] = [
  [/patna/i, MapPin],
  [/bihar/i, Flag],
  [/history|culture/i, Landmark],
  [/lifestyle|food/i, Coffee],
  [/education/i, GraduationCap],
  [/business/i, Briefcase],
  [/travel/i, Plane],
];

function categoryIcon(name: string) {
  return CATEGORY_ICONS.find(([re]) => re.test(name))?.[1] ?? Newspaper;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; page?: string; tag?: string }>;
}) {
  const { category, sort = 'latest', page = '1', tag } = await searchParams;

  const [listRes, allRes, catsRes] = await Promise.allSettled([
    api.getBlogPosts({ page: Number(page) || 1, per_page: PER_PAGE, ...(category ? { category } : {}), ...(tag ? { tag } : {}) }),
    api.getBlogPosts({ per_page: 100 }),
    api.getBlogCategories(),
  ]);

  const list: any = listRes.status === 'fulfilled' ? listRes.value : null;
  const all: any = allRes.status === 'fulfilled' ? allRes.value : null;
  const cats: any = catsRes.status === 'fulfilled' ? catsRes.value : [];

  const rawItems: any[] = Array.isArray(list) ? list : list?.data || [];
  const items = sort === 'oldest' ? [...rawItems].reverse() : rawItems;
  const currentPage = Number(list?.current_page || page) || 1;
  const lastPage = Number(list?.last_page || 1) || 1;

  const allPosts: any[] = Array.isArray(all) ? all : all?.data || [];
  const popular = allPosts.slice(0, 5);
  const counts: Record<string, number> = {};
  for (const p of allPosts) {
    if (p?.category) counts[p.category] = (counts[p.category] || 0) + 1;
  }

  const categories: string[] = (Array.isArray(cats) ? cats : [])
    .map((c: any) => (typeof c === 'string' ? c : c?.name))
    .filter(Boolean);

  const buildHref = (overrides: { category?: string; page?: number }) => {
    const sp = new URLSearchParams();
    const cat = overrides.category !== undefined ? overrides.category : category;
    if (cat) sp.set('category', cat);
    if (sort !== 'latest') sp.set('sort', sort);
    const p = overrides.page ?? 1;
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `/blog?${qs}` : '/blog';
  };

  const windowStart = Math.max(1, Math.min(currentPage - 2, lastPage - 4));
  const pageNumbers = Array.from({ length: Math.min(5, lastPage) }, (_, i) => windowStart + i);

  const pillClass = (active: boolean) =>
    active
      ? 'rounded-full bg-amber-400 px-4 py-1.5 text-sm font-semibold text-gray-900 shadow-sm'
      : 'rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:border-amber-400 hover:text-amber-600';

  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-gray-50">
        <img
          src="/images/patna-monument1.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-[55%] object-cover object-left opacity-25 [mask-image:linear-gradient(to_right,transparent,black_45%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-amber-500">Patna Finder</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">Blogs &amp; Articles</h1>
          <p className="mt-3 max-w-xl leading-relaxed text-gray-600">
            Discover stories, updates, and useful information about Patna, Bihar and beyond. Explore our
            latest articles, guides and insights.
          </p>
          <div className="mt-6 h-1 w-12 rounded-full bg-amber-400" />
        </div>
      </section>

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
          <li className="font-medium text-gray-800">Blogs</li>
        </ol>
      </nav>

      {/* ── Category pills + sort ── */}
      <section className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={buildHref({ category: '' })} className={pillClass(!category)}>
            All
          </Link>
          {categories.map((c) => (
            <Link key={c} href={buildHref({ category: c })} className={pillClass(category === c)}>
              {c}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by</span>
            <BlogSortSelect value={sort} category={category} />
          </div>
        </div>
      </section>

      {/* ── Grid + sidebar ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            {items.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((post: any) => (
                  <article
                    key={post.id}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Link href={`/blog/${post.slug}`} className="block">
                      <div className="relative h-36 overflow-hidden bg-amber-50">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 text-amber-300">
                            <Newspaper size={40} />
                          </div>
                        )}
                        <span className="absolute left-3 top-3 rounded-md bg-amber-400 px-2.5 py-1 text-[11px] font-semibold text-gray-900 shadow-sm">
                          {post.category}
                        </span>
                      </div>

                      <div className="p-4">
                        <h3 className="mb-1.5 line-clamp-2 text-lg font-bold leading-snug text-gray-900 transition group-hover:text-amber-600">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-500">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar size={13} /> {formatDate(post.published_at)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={13} /> {readTime(post)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-20 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                  <Newspaper size={26} />
                </div>
                <h3 className="mb-1 text-xl font-bold text-gray-900">No blog posts found</h3>
                <p className="text-sm text-gray-500">Check back soon for the latest stories from Patna.</p>
              </div>
            )}

            {/* ── Pagination ── */}
            {lastPage > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {currentPage > 1 && (
                  <Link
                    href={buildHref({ page: currentPage - 1 })}
                    aria-label="Previous page"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-amber-400 hover:text-amber-600"
                  >
                    <ChevronLeft size={16} />
                  </Link>
                )}
                {pageNumbers.map((n) => (
                  <Link
                    key={n}
                    href={buildHref({ page: n })}
                    aria-current={n === currentPage ? 'page' : undefined}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                      n === currentPage
                        ? 'bg-amber-400 text-gray-900 shadow-sm'
                        : 'border border-gray-200 bg-white text-gray-700 hover:border-amber-400 hover:text-amber-600'
                    }`}
                  >
                    {n}
                  </Link>
                ))}
                {currentPage < lastPage && (
                  <Link
                    href={buildHref({ page: currentPage + 1 })}
                    aria-label="Next page"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-amber-400 hover:text-amber-600"
                  >
                    <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            )}
          </div>
          {/* ── Sidebar ── */}
          {/* Sidebar — sticky on desktop; height grows with content (not fixed) */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Stay Updated */}
            <div className="rounded-2xl bg-amber-50 p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-500">
                <Send size={18} />
              </div>
              <h3 className="mb-1.5 text-lg font-bold text-gray-900">Stay Updated</h3>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">
                Get the latest blogs, news and updates straight to your inbox.
              </p>
              <NewsletterForm />
            </div>

            {/* Popular Blogs */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <TrendingUp size={18} className="text-amber-500" /> Popular Blogs
              </h3>
              <div className="space-y-4">
                {popular.map((p: any) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="group flex gap-3">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-amber-50">
                      {p.featured_image ? (
                        <img
                          src={p.featured_image}
                          alt=""
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
                {popular.length === 0 && <p className="text-sm text-gray-400">No posts yet.</p>}
              </div>
            </div>

            {/* Categories */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <LayoutGrid size={18} className="text-amber-500" /> Categories
              </h3>
              <div className="space-y-1">
                {categories.map((c) => {
                  const Icon = categoryIcon(c);
                  return (
                    <Link
                      key={c}
                      href={`/blog?category=${encodeURIComponent(c)}`}
                      className="group flex items-center justify-between rounded-lg px-2 py-2 transition hover:bg-amber-50"
                    >
                      <span className="inline-flex items-center gap-2.5 text-sm font-medium text-gray-700 transition group-hover:text-amber-600">
                        <Icon size={16} className="text-amber-500" /> {c}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                          {counts[c] || 0}
                        </span>
                        <ChevronRight size={14} className="text-gray-300 transition group-hover:text-amber-600" />
                      </span>
                    </Link>
                  );
                })}
                {categories.length === 0 && <p className="text-sm text-gray-400">No categories yet.</p>}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
