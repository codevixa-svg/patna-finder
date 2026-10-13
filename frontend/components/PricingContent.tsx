'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CircleCheck,
  Crown,
  Gem,
  LayoutGrid,
  MapPin,
  Rocket,
  Star,
  Store,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

type IconComponent = React.ComponentType<{ className?: string }>;

// Hero highlights — gold icon + label, sitting under the hero copy.
const HERO_FEATURES: { icon: IconComponent; label: string }[] = [
  { icon: BarChart3, label: 'More Visibility' },
  { icon: Users, label: 'Reach Local Customers' },
  { icon: Star, label: 'Build Trust' },
];

// Yearly billing saves 20% versus paying month by month.
const YEARLY_DISCOUNT = 0.2;

type BillingCycle = 'monthly' | 'yearly';

type Plan = {
  name: string;
  tagline: string;
  /** Monthly price in ₹ (0 = free forever). */
  price: number;
  icon: IconComponent;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Free Listing',
    tagline: 'Get started with basic listing and reach local customers.',
    price: 0,
    icon: Store,
    features: [
      'Business Profile Listing',
      'Basic Information',
      'Location on Map',
      '1 Category',
      'Customer Reviews',
      'Standard Support',
    ],
    cta: 'Get Started Free',
    href: '/dashboard/register',
  },
  {
    name: 'Basic Plan',
    tagline: 'Perfect for small businesses to get more visibility.',
    price: 100,
    icon: Rocket,
    features: [
      'Everything in Free',
      'Featured in Category',
      'Add Photos (Up to 10)',
      'Business Description',
      'Contact Details',
      'Google Map Integration',
      'Standard Support',
    ],
    cta: 'Choose Basic',
    href: '/dashboard/billing',
  },
  {
    name: 'Premium Plan',
    tagline: 'Boost your visibility and get more customers.',
    price: 300,
    icon: Gem,
    features: [
      'Everything in Basic',
      'Top in Category Listing',
      'Add Photos & Videos (Up to 30)',
      'Business Highlights',
      'Special Offers & Events',
      'Social Media Links',
      'Priority Support',
    ],
    cta: 'Choose Premium',
    href: '/dashboard/billing',
    featured: true,
  },
  {
    name: 'Business Pro',
    tagline: 'For established businesses that want maximum reach.',
    price: 500,
    icon: Building2,
    features: [
      'Everything in Premium',
      'Homepage Featured Listing',
      'Custom Banner',
      'SEO Optimized Profile',
      'Unlimited Photos & Videos',
      'Get More Leads (Enquiry Form)',
      'Dedicated Support',
    ],
    cta: 'Choose Pro',
    href: '/dashboard/billing',
  },
];

type CompareValue = boolean | string;

const COMPARE_ROWS: {
  feature: string;
  free: CompareValue;
  basic: CompareValue;
  premium: CompareValue;
  pro: CompareValue;
}[] = [
  { feature: 'Business Profile Listing', free: true, basic: true, premium: true, pro: true },
  { feature: 'Featured in Category', free: false, basic: true, premium: true, pro: true },
  { feature: 'Top in Category', free: false, basic: false, premium: true, pro: true },
  { feature: 'Photos Upload', free: 'Up to 5', basic: 'Up to 10', premium: 'Up to 30', pro: 'Unlimited' },
  { feature: 'Videos Upload', free: false, basic: false, premium: 'Up to 10', pro: 'Unlimited' },
  { feature: 'Business Highlights', free: false, basic: false, premium: true, pro: true },
  { feature: 'Special Offers & Events', free: false, basic: false, premium: true, pro: true },
  { feature: 'Homepage Featured', free: false, basic: false, premium: false, pro: true },
  { feature: 'SEO Optimized Profile', free: false, basic: false, premium: false, pro: true },
  { feature: 'Customer Support', free: 'Standard', basic: 'Standard', premium: 'Priority', pro: 'Dedicated' },
];

// Sidebar bullets: why a Patna business should list with us.
const WHY_LIST: { icon: IconComponent; title: string; text: string }[] = [
  {
    icon: Users,
    title: 'Reach Your Target Audience',
    text: 'Get discovered by thousands of local customers searching for businesses like yours.',
  },
  {
    icon: Star,
    title: 'Build Trust',
    text: 'Verified listings, customer reviews and ratings help you build credibility.',
  },
  {
    icon: TrendingUp,
    title: 'Increase Leads & Sales',
    text: 'More visibility means more customer inquiries and business growth.',
  },
  {
    icon: LayoutGrid,
    title: 'Easy to Manage',
    text: 'Update your profile, photos, offers and more anytime from your dashboard.',
  },
];

// CTA band counters.
const CTA_STATS: { icon: IconComponent; value: string; label: string }[] = [
  { icon: Store, value: '1000+', label: 'Listed Businesses' },
  { icon: Users, value: '50K+', label: 'Monthly Visitors' },
  { icon: Star, value: '4.8', label: 'Average Rating' },
];

const FAQS = [
  {
    q: 'Can I upgrade or downgrade anytime?',
    a: 'Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The Free Listing plan is always available with no time limit. You can upgrade to Basic, Premium or Business Pro whenever you are ready.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept UPI, Credit/Debit Cards, Net Banking and popular wallets through our secure payment partner Razorpay.',
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'You can cancel from your Dashboard > Billing page. Your plan will remain active until the end of the current billing period.',
  },
];

// Placeholder city photo — the same Unsplash image the About / Best of Patna heroes use.
const unsplash = (id: string, w = 400) =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`;

/** One "✓ / ✕ / text" cell of the comparison table. */
function CompareCell({
  value,
  highlight = false,
}: {
  value: CompareValue;
  highlight?: boolean;
}) {
  return (
    <td className={`px-3 py-3 text-center ${highlight ? 'bg-[#FFFBF0]' : ''}`}>
      {typeof value === 'boolean' ? (
        value ? (
          <CircleCheck className="mx-auto h-5 w-5 text-[#D89E00]" aria-label="Included" />
        ) : (
          <X className="mx-auto h-4 w-4 text-gray-300" aria-label="Not included" />
        )
      ) : (
        <span className="text-xs font-semibold text-gray-600">{value}</span>
      )}
    </td>
  );
}

/** ₹ per month when a plan is paid yearly (20% cheaper). */
const yearlyMonthly = (price: number) => Math.round(price * (1 - YEARLY_DISCOUNT));
/** ₹ charged once a year when a plan is paid yearly. */
const yearlyTotal = (price: number) => Math.round(price * 12 * (1 - YEARLY_DISCOUNT));

/**
 * Pricing page body — the plan picker for businesses listing on Khojya:
 * photo hero → Monthly/Yearly toggle floating over the white plans panel →
 * the four plan cards → "Compare Features" table with the "Why List" sidebar →
 * the navy CTA band and the FAQ. All in the site theme (navy #062B49, gold
 * #F4B400).
 */
export default function PricingContent() {
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const isYearly = billing === 'yearly';

  return (
    <main className="min-h-screen bg-[#F7F9FC]">
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

        <div className="relative mx-auto max-w-[1240px] px-4 pb-24 pt-20 sm:px-6 sm:pt-24 md:pb-28 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <Breadcrumbs items={[{ label: 'Pricing' }]} variant="hero" className="mb-6" />

              <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
                Choose the Right Plan
                <br className="hidden sm:block" />
                <span className="text-[#F4B400]">for Your Business</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
                Get more visibility, more customers and grow your business with
                Khojya. Flexible plans for every business type.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3">
                {HERO_FEATURES.map((feature) => (
                  <span
                    key={feature.label}
                    className="flex items-center gap-2.5 text-sm font-medium text-white/90"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400]">
                      <feature.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    {feature.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Script accent + city badge (desktop) */}
            <div className="hidden shrink-0 flex-col items-end gap-5 lg:flex">
              <p className="font-script -rotate-3 text-right text-2xl leading-snug text-[#F4B400] xl:text-3xl">
                Same City,
                <br />
                More Possibilities 💛
              </p>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                <MapPin className="h-4 w-4 text-[#F4B400]" aria-hidden="true" />
                Patna, Bihar
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Billing toggle + plans panel ─────────────────────────────── */}
      <div className="relative z-30 mx-auto -mt-10 max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div
            role="group"
            aria-label="Billing cycle"
            className="relative z-10 inline-flex items-center gap-1 rounded-full border border-gray-100 bg-white p-1.5 shadow-[0_10px_30px_rgba(8,28,58,0.12)]"
          >
            <button
              type="button"
              onClick={() => setBilling('monthly')}
              aria-pressed={!isYearly}
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition ${
                !isYearly ? 'bg-[#F4B400] text-[#062B49]' : 'text-gray-500 hover:text-[#062B49]'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling('yearly')}
              aria-pressed={isYearly}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                isYearly ? 'bg-[#F4B400] text-[#062B49]' : 'text-gray-500 hover:text-[#062B49]'
              }`}
            >
              Yearly
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  isYearly ? 'bg-[#062B49] text-[#F4B400]' : 'bg-[#E8F5E9] text-[#2E7D32]'
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="-mt-4 rounded-3xl border border-gray-100 bg-white p-4 pt-9 shadow-[0_10px_30px_rgba(8,28,58,0.06)] sm:p-5 sm:pt-10 lg:p-6 lg:pt-11">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const monthly =
                isYearly && plan.price > 0 ? yearlyMonthly(plan.price) : plan.price;

              return (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl border p-6 transition sm:p-7 ${
                    plan.featured
                      ? 'border-[#F4B400] bg-[#FFFBF0] shadow-[0_10px_30px_rgba(244,180,0,0.18)]'
                      : 'border-gray-100 bg-white hover:border-[#F4B400]/60'
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#F4B400] px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-[#062B49] shadow">
                      <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                      Most Popular
                    </span>
                  )}

                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-gray-100 bg-white text-[#062B49]">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-[#062B49]">{plan.name}</h2>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">{plan.tagline}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-end gap-1.5">
                    <span className="font-heading text-4xl font-extrabold leading-none text-[#062B49]">
                      ₹{monthly}
                    </span>
                    <span className="pb-0.5 text-sm text-gray-500">/month</span>
                  </div>

                  {isYearly && plan.price > 0 && (
                    <p className="mt-2 text-xs font-semibold text-[#B58200]">
                      Billed ₹{yearlyTotal(plan.price)} once a year — save 20%
                    </p>
                  )}

                  <ul className="mt-4 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                        <CircleCheck
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#D89E00]"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition ${
                      plan.featured
                        ? 'bg-[#F4B400] text-[#062B49] shadow-lg hover:bg-[#FFDF80]'
                        : 'border border-gray-200 bg-white text-[#062B49] hover:border-[#F4B400] hover:bg-[#FFF9E5]'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Compare features + why list ──────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-4 pb-12 pt-10 sm:px-6 sm:pb-14 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-[#062B49] sm:text-2xl">Compare Features</h2>

            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#062B49] text-white">
                      <th scope="col" className="px-4 py-3 text-left font-bold sm:px-5">
                        Features
                      </th>
                      <th scope="col" className="px-3 py-3 text-center font-bold">
                        Free
                      </th>
                      <th scope="col" className="px-3 py-3 text-center font-bold">
                        Basic
                      </th>
                      <th scope="col" className="px-3 py-3 text-center font-bold text-[#F4B400]">
                        Premium
                      </th>
                      <th scope="col" className="px-3 py-3 text-center font-bold sm:px-4">
                        Business Pro
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {COMPARE_ROWS.map((row) => (
                      <tr key={row.feature} className="even:bg-[#FBFCFE]">
                        <th
                          scope="row"
                          className="px-4 py-3 text-left text-sm font-medium text-gray-700 sm:px-5"
                        >
                          {row.feature}
                        </th>
                        <CompareCell value={row.free} />
                        <CompareCell value={row.basic} />
                        <CompareCell value={row.premium} highlight />
                        <CompareCell value={row.pro} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="min-w-0">
            <h2 className="text-xl font-extrabold text-[#062B49] sm:text-2xl">
              Why List Your Business on Khojya?
            </h2>

            <div className="mt-4 space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              {WHY_LIST.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#D89E00]">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#062B49]">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>


      {/* ── CTA band ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1240px] px-4  sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#041F35] via-[#062B49] to-[#0B3A63]">
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
          {/* Faint skyline on the right (desktop) */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[420px] opacity-10 md:block"
            aria-hidden="true"
          >
            <Image
              src="/images/patna-monument1.png"
              alt=""
              fill
              sizes="420px"
              className="object-cover object-bottom"
            />
          </div>

          <div className="relative flex flex-col items-start gap-8 px-6 py-8 sm:px-9 sm:py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="flex items-start gap-5">
              <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#F4B400]/40 bg-[#F4B400]/10 text-[#F4B400] sm:flex">
                <Store className="h-7 w-7" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-extrabold text-white sm:text-2xl">
                  Ready to Grow Your Business in Patna?
                </h2>
                <p className="mt-2 max-w-xl text-sm text-gray-300">
                  Join hundreds of businesses already listed on Khojya and start getting
                  noticed today.
                </p>
                <Link
                  href="/dashboard/register"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F4B400] px-6 py-3 text-sm font-bold text-[#062B49] shadow-lg transition hover:bg-[#FFDF80]"
                >
                  Add Your Business
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
              {CTA_STATS.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4B400]/15 text-[#F4B400]">
                    <stat.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-heading text-xl font-extrabold leading-none text-white">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-gray-300">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

