'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BedDouble,
  Clock3,
  Coffee,
  Crown,
  Dumbbell,
  Eye,
  GraduationCap,
  HandHeart,
  Hospital,
  LayoutGrid,
  Quote,
  ShieldCheck,
  Smile,
  Star,
  Stethoscope,
  TrendingUp,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import BestBusinessCard from './BestBusinessCard';

type IconComponent = React.ComponentType<{ className?: string }>;

// Pill categories — mirrors the seeded site categories. Pills link to the
// per-category Best of Patna pages.
const CATEGORIES: { slug: string; short: string; icon: IconComponent }[] = [
  { slug: 'restaurants', short: 'Restaurants', icon: UtensilsIcon },
  { slug: 'cafes', short: 'Cafés', icon: Coffee },
  { slug: 'hospitals', short: 'Hospitals', icon: Hospital },
  { slug: 'coaching', short: 'Coaching', icon: GraduationCap },
  { slug: 'dentists', short: 'Dentists', icon: Smile },
  { slug: 'doctors', short: 'Doctors', icon: Stethoscope },
  { slug: 'gyms', short: 'Gyms', icon: Dumbbell },
  { slug: 'hotels', short: 'Hotels', icon: BedDouble },
];

// "Why This List?" sidebar bullets.
const WHY_LIST: { icon: IconComponent; label: string }[] = [
  { icon: Star, label: 'Based on real reviews' },
  { icon: Users, label: 'Curated by locals' },
  { icon: ShieldCheck, label: 'Top-rated & trusted' },
  { icon: Clock3, label: 'Regularly updated' },
  { icon: HandHeart, label: 'Supports local businesses' },
];

// CTA band feature bullets.
const CTA_FEATURES: { icon: IconComponent; label: string }[] = [
  { icon: Eye, label: 'More Visibility' },
  { icon: ShieldCheck, label: 'Build Trust' },
  { icon: Users, label: 'Attract Customers' },
  { icon: TrendingUp, label: 'Grow Faster' },
];

// Explore-by-Category cards — Unsplash placeholders the owner can swap later.
const unsplash = (id: string, w = 400) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

const EXPLORE_CATEGORY_CARDS = [
  { slug: 'restaurants', label: 'Restaurants', image: unsplash('photo-1504674900247-0877df9cc836') },
  { slug: 'cafes', label: 'Cafés', image: unsplash('photo-1495474472287-4d71bcdd2085') },
  { slug: 'hospitals', label: 'Hospitals', image: unsplash('photo-1538108149393-fbbd81895907') },
  { slug: 'coaching', label: 'Coaching', image: unsplash('photo-1434030216411-0b793f4b4173') },
  { slug: 'gyms', label: 'Gyms', image: unsplash('photo-1534438327276-14e5300c3a48') },
  { slug: 'hotels', label: 'Hotels', image: unsplash('photo-1566073771259-6a8506099945') },
];

// Inline utensils SVG (same 24×24 line style as Lucide) for the pill bar —
// wrapped so CATEGORIES stays a pure data table.
function UtensilsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

/**
 * Best of Patna page body — photo hero with a "Curated by Locals" badge,
 * a floating category-pill bar overlapping the hero, the "Top 10 in Patna"
 * ranked grid, an "Explore by Category" strip, a right sidebar (Why This
 * List / Suggest a Listing / quote card) and the "Own a Business" CTA band.
 * All in the site theme (navy #062B49, gold #F4B400).
 */
export default function BestOfPatnaBrowser({
  breadcrumb,
}: {
  breadcrumb?: React.ReactNode;
}) {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-rated picks for the "Top 10 in Patna" grid (shows the first 4).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.getBusinesses({ sort_by: 'rating', per_page: 12 });
        const list: any[] = Array.isArray(data) ? data : data?.data || [];
        if (!cancelled) setBusinesses(list.slice(0, 4));
      } catch {
        if (!cancelled) setBusinesses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-[#F7F9FC]">
      {/* ── Photo hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#062B49]">
        <Image
          src={unsplash('photo-1477959858617-67f85cf4f1df', 1600)}
          alt="Patna skyline at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#041F35]/95 via-[#062B49]/85 to-[#062B49]/50" />

        <div className="relative mx-auto max-w-[1240px] px-4 pb-16 pt-20 sm:px-6 sm:pt-24 md:pb-20 md:pt-28 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              {breadcrumb && <div className="mb-6">{breadcrumb}</div>}
              <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
                The Best of <span className="text-[#F4B400]">Patna</span>
              </h1>
              <p className="mt-3 text-lg font-bold text-white/95 md:text-xl">
                Handpicked places, loved by the city.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
                From iconic food joints to top schools, trusted hospitals to
                happening hangouts — explore the best that Patna has to offer,
                all in one place.
              </p>
            </div>

            {/* Curated badge + script accent (desktop) */}
            <div className="hidden shrink-0 flex-col items-end gap-6 pt-2 lg:flex">
              <div className="inline-flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                <Crown className="h-6 w-6 text-[#F4B400]" aria-hidden="true" />
                <span className="text-sm leading-tight">
                  <span className="block font-bold text-white">Curated by Locals</span>
                  <span className="block text-xs text-white/60">For Everyone</span>
                </span>
              </div>
              <p className="font-script -rotate-3 text-right text-2xl leading-snug text-[#F4B400] xl:text-3xl">
                Same City,
                <br />
                More Possibilities 💛
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating category pills bar ─────────────────────────────── */}
      <div className="relative z-30 mx-auto -mt-8 max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Best of Patna categories"
          className="rounded-2xl border border-gray-100 bg-white p-2.5 shadow-[0_10px_30px_rgba(8,28,58,0.10)] sm:p-3"
        >
          <div className="scrollbar-hide flex gap-2 overflow-x-auto sm:overflow-visible lg:flex-wrap">
            <Link
              href="/best-of-patna"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#062B49] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0B3A63]"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              All
            </Link>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/best-of-patna/${cat.slug}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:border-[#F4B400] hover:bg-[#FFF9E5] hover:text-[#062B49]"
              >
                <cat.icon className="h-4 w-4 text-[#D89E00]" aria-hidden="true" />
                {cat.short}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* ── Top 10 in Patna ────────────────────────────────────────── */}
      <section
        id="top10"
        className="mx-auto max-w-[1240px] scroll-mt-24 px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-[#062B49] sm:text-2xl md:text-3xl">
              Top 10 in Patna
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              The most loved businesses across the city, ranked by real reviews.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#B58200] transition hover:text-[#062B49]"
          >
            View All
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[330px] animate-pulse rounded-2xl border border-gray-100 bg-white"
                />
              ))
            : businesses.map((business, index) => (
                <BestBusinessCard
                  key={business.id || index}
                  business={business}
                  rank={index + 1}
                />
              ))}
        </div>

        {!loading && businesses.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
            Rankings are being curated — please check back soon.
          </p>
        )}
      </section>

      {/* ── Explore by Category ────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-4 pb-12 sm:px-6 sm:pb-14 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-extrabold text-[#062B49] sm:text-2xl md:text-3xl">
            Explore by Category
          </h2>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#B58200] transition hover:text-[#062B49]"
          >
            View All
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {EXPLORE_CATEGORY_CARDS.map((cat) => (
            <Link
              key={cat.slug}
              href={`/best-of-patna/${cat.slug}`}
              className="group relative h-28 overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={cat.image}
                alt={cat.label}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041F35]/90 via-[#062B49]/25 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-2.5 text-sm font-bold text-white">
                {cat.label}
                <ArrowRight
                  className="h-4 w-4 text-[#F4B400] transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Main content + sidebar ─────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Featured winners */}
          <div>
            <h2 className="text-xl font-extrabold text-[#062B49] sm:text-2xl">
              This Year's Winners
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Community favourites across the city — updated for 2026.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[330px] animate-pulse rounded-2xl border border-gray-100 bg-white"
                    />
                  ))
                : businesses.map((business, index) => (
                    <BestBusinessCard
                      key={`win-${business.id || index}`}
                      business={business}
                      rank={index + 5}
                    />
                  ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-5">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-[#062B49]">
                Why This List?
              </h3>
              <ul className="mt-4 space-y-3.5">
                {WHY_LIST.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF4CC]">
                      <item.icon
                        className="h-4 w-4 text-[#D89E00]"
                        aria-hidden="true"
                      />
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-[#062B49]">
                Suggest a Listing
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">
                Know a hidden gem that deserves a spot? Tell us and we'll check
                it out.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-[#062B49] py-2 text-sm font-bold text-[#062B49] transition hover:bg-[#062B49] hover:text-white"
              >
                Suggest Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <figure className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
              <Quote
                className="mx-auto h-6 w-6 text-[#F4B400]"
                aria-hidden="true"
              />
              <blockquote className="mt-3 text-sm font-semibold italic leading-relaxed text-[#062B49]">
                "Patna's best, chosen by the people who know it best."
              </blockquote>
              <figcaption className="mt-2 text-xs text-gray-400">
                — The Patna Finder Team
              </figcaption>
            </figure>
          </aside>
        </div>
      </section>

      {/* ── CTA band ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#041F35] via-[#062B49] to-[#0B3A63]">
        {/* Subtle dot texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto flex max-w-[1240px] flex-col items-start gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <h2 className="font-heading text-xl font-extrabold text-white sm:text-2xl">
              Own a Business in Patna?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-gray-300">
              List your business for free and reach thousands of potential
              customers.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2.5">
              {CTA_FEATURES.map((feature) => (
                <span
                  key={feature.label}
                  className="flex items-center gap-2 text-sm font-medium text-white/90"
                >
                  <feature.icon
                    className="h-5 w-5 text-[#F4B400]"
                    aria-hidden="true"
                  />
                  {feature.label}
                </span>
              ))}
            </div>
          </div>

          <Link
            href="/dashboard/add-business"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#F4B400] px-6 py-3 text-sm font-bold text-[#062B49] shadow-lg transition hover:bg-[#FFDF80]"
          >
            List Your Business
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}