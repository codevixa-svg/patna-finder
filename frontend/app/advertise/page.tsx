import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BarChart3,
  CircleCheck,
  ClipboardList,
  Crown,
  Eye,
  FilePenLine,
  Gem,
  Heart,
  Lightbulb,
  MapPin,
  Megaphone,
  Rocket,
  Search,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Advertise With Us - Grow Your Business in Patna',
  description:
    'Get more visibility, more customers and faster growth for your business in Patna. Reach thousands of local customers with Patna Finder.',
  alternates: { canonical: '/advertise' },
};

type IconComponent = React.ComponentType<{ className?: string }>;

/** Glass chips under the hero copy — solid colour tiles (amber / red / green / purple). */
const HERO_CHIPS: { icon: IconComponent; tile: string; label: string }[] = [
  { icon: Users, tile: 'bg-[#F4B400]', label: 'Reach Local\nCustomers' },
  { icon: BarChart3, tile: 'bg-[#EF4444]', label: 'Increase\nBrand Visibility' },
  { icon: Target, tile: 'bg-[#22C55E]', label: 'Target the\nRight Audience' },
  { icon: Rocket, tile: 'bg-[#A855F7]', label: 'Grow Your\nBusiness Faster' },
];

/** Dark highlights panel on the right of the hero. */
const HERO_PANEL: { icon: IconComponent; label: string }[] = [
  { icon: MapPin, label: "Patna's Largest Local Platform" },
  { icon: Users, label: 'Thousands of Monthly Visitors' },
  { icon: Eye, label: 'Showcase Your Business Effectively' },
];
type Plan = {
  name: string;
  tagline: string;
  /** Display price, billed monthly. */
  price: string;
  icon: IconComponent;
  /** Tinted icon tile classes. */
  tile: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

/** Advertising plans — copy matches the reference design exactly. */
const PLANS: Plan[] = [
  {
    name: 'Basic Plan',
    tagline: 'Get started and build your presence.',
    price: '₹499',
    icon: Rocket,
    tile: 'bg-blue-50 text-blue-500',
    features: [
      'Business Listing',
      'Basic Information',
      'Location on Map',
      '1 Category',
      'Contact Details',
      'Standard Support',
    ],
    cta: 'Choose Basic',
  },
  {
    name: 'Featured Plan',
    tagline: 'Get more visibility and leads.',
    price: '₹999',
    icon: Star,
    tile: 'bg-amber-50 text-amber-500',
    features: [
      'Everything in Basic',
      'Featured Listing',
      'Add Photos (Up to 10)',
      'Business Highlights',
      'Website & Social Links',
      'Priority Support',
    ],
    cta: 'Choose Featured',
  },
  {
    name: 'Premium Plan',
    tagline: 'Boost your business growth.',
    price: '₹1,999',
    icon: Gem,
    tile: 'bg-amber-100 text-amber-600',
    features: [
      'Everything in Featured',
      'Top in Category',
      'Add Photos & Videos (Up to 30)',
      'Special Offers & Events',
      'SEO Optimized Profile',
      'Lead Enquiry Form',
      'Social Media Links',
      'Priority Support',
    ],
    cta: 'Choose Premium',
    popular: true,
  },
  {
    name: 'Business Pro',
    tagline: 'For established businesses.',
    price: '₹3,999',
    icon: Crown,
    tile: 'bg-purple-100 text-purple-600',
    features: [
      'Everything in Premium',
      'Homepage Banner Listing',
      'Custom Banner Design',
      'Multiple Category Listing',
      'Verified Business Badge',
      'More Leads & Enquiries',
      'Dedicated Account Manager',
      'Priority Support',
    ],
    cta: 'Choose Pro',
  },
];
/** Four-step "How It Works" journey — number badges keep the reference colours. */
const STEPS: { n: string; badge: string; icon: IconComponent; title: string; desc: string }[] = [
  {
    n: '1',
    badge: 'bg-blue-500',
    icon: ClipboardList,
    title: 'Choose a Plan',
    desc: 'Select the best plan for your business.',
  },
  {
    n: '2',
    badge: 'bg-[#F4B400]',
    icon: FilePenLine,
    title: 'Submit Details',
    desc: 'Fill your business information.',
  },
  {
    n: '3',
    badge: 'bg-emerald-500',
    icon: CircleCheck,
    title: 'Get Verified',
    desc: 'Our team will review and verify your listing.',
  },
  {
    n: '4',
    badge: 'bg-purple-500',
    icon: Rocket,
    title: 'Go Live',
    desc: 'Start getting more visibility and customers.',
  },
];

/** "Why Advertise with Us?" benefit cards. */
const WHY_ITEMS: { icon: IconComponent; title: string; desc: string }[] = [
  {
    icon: Users,
    title: 'Targeted Local Audience',
    desc: 'Reach people who are actively searching for businesses in Patna.',
  },
  {
    icon: Eye,
    title: 'Better Visibility',
    desc: 'Appear in top search results and category pages.',
  },
  {
    icon: TrendingUp,
    title: 'More Leads & Customers',
    desc: 'Get enquiries, calls and website visits from potential customers.',
  },
  {
    icon: ShieldCheck,
    title: 'Trusted Platform',
    desc: 'Be part of a growing and trusted local community.',
  },
];

/** Final CTA band statistics. */
const CTA_STATS: { icon: IconComponent; value: string; label: string }[] = [
  { icon: BarChart3, value: '50K+', label: 'Monthly Visitors' },
  { icon: Lightbulb, value: '1,000+', label: 'Listed Businesses' },
  { icon: Star, value: '25K+', label: 'Local Customers' },
];
export default function AdvertisePage() {
  return (
    <main className="bg-[#F7F9FC]">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden text-white">
        {/* Patna nightscape background (site-standard hero image) */}
        <div className="absolute inset-0">
          <Image
            src="/images/patna-monument1.png"
            alt=""
            fill
            sizes="100vw"
            priority
            quality={90}
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#041F35]/95 via-[#041F35]/80 to-[#041F35]/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#041F35]/70 via-transparent to-[#041F35]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-32">
          {/* Handwritten accent — "Same City, More Possibilities" */}
          <span
            aria-hidden="true"
            className="font-script pointer-events-none absolute right-[380px] top-28 hidden -rotate-2 text-3xl leading-tight text-white/90 lg:block"
          >
            Same City,
            <br />
            More Possibilities<span className="text-[#F4B400]">♥</span>
          </span>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            {/* Left content */}
            <div>
              {/* Badge */}
              <span className="inline-flex items-center gap-2 rounded-full bg-[#041F35]/70 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F4B400] text-[#062B49]">
                  <Megaphone className="h-4 w-4" aria-hidden="true" />
                </span>
                Grow Your Business in Patna
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Advertise on
                <br />
                <span className="text-[#F4B400]">Patna Finder</span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-200 sm:text-lg">
                Get more visibility, more customers and faster growth
                <br className="hidden sm:block" /> for your business in Patna.
              </p>

              {/* Feature chips */}
              <div className="mt-8 flex flex-wrap gap-3">
                {HERO_CHIPS.map((chip) => (
                  <div
                    key={chip.label}
                    className="flex items-center gap-3 rounded-2xl bg-black/25 px-4 py-3 backdrop-blur-sm"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${chip.tile}`}
                    >
                      <chip.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="whitespace-pre-line text-sm font-semibold leading-tight text-white">
                      {chip.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dark highlights panel */}
            <div className="rounded-3xl border border-white/10 bg-[#050D18]/85 p-6 backdrop-blur-md lg:justify-self-end">
              <ul className="space-y-5">
                {HERO_PANEL.map((item) => (
                  <li key={item.label} className="flex items-center gap-4">
                    <item.icon className="h-6 w-6 shrink-0 text-[#F4B400]" aria-hidden="true" />
                    <span className="text-sm font-bold leading-snug text-white">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      {/* ── Stat cards (overlap the hero bottom) ─────────────────────── */}
      <section className="relative z-10 mx-auto -mt-14 max-w-7xl px-4 sm:-mt-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {/* Monthly visitors */}
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-[0_12px_30px_rgba(6,43,73,0.10)]">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <BarChart3 className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <div className="text-3xl font-extrabold leading-none text-[#062B49]">50K+</div>
                <div className="mt-1.5 text-sm text-gray-500">Monthly Visitors</div>
              </div>
            </div>
            {/* Rising chart accent */}
            <svg
              viewBox="0 0 96 44"
              className="h-11 w-24 shrink-0 text-[#F4B400]"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 38 L26 24 L46 30 L70 10" />
              <path d="M58 10 H70 V22" />
              <circle cx="26" cy="24" r="3" fill="currentColor" stroke="none" />
              <circle cx="46" cy="30" r="3" fill="currentColor" stroke="none" />
            </svg>
          </div>

          {/* Local customers */}
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-[0_12px_30px_rgba(6,43,73,0.10)]">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Users className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <div className="text-3xl font-extrabold leading-none text-[#062B49]">25K+</div>
                <div className="mt-1.5 text-sm text-gray-500">Local Customers</div>
              </div>
            </div>
            {/* Avatar cluster */}
            <div className="flex shrink-0 -space-x-3" aria-hidden="true">
              {['bg-blue-500', 'bg-orange-400', 'bg-purple-500'].map((color) => (
                <span
                  key={color}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white ${color}`}
                >
                  <User className="h-5 w-5" />
                </span>
              ))}
            </div>
          </div>

          {/* Coverage */}
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-[0_12px_30px_rgba(6,43,73,0.10)] sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                <MapPin className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <div className="text-2xl font-extrabold leading-none text-[#062B49]">
                  Wide Coverage
                </div>
                <div className="mt-1.5 text-sm text-gray-500">Patna &amp; Surrounding Areas</div>
              </div>
            </div>
            {/* Faint city skyline accent */}
            <svg
              viewBox="0 0 120 48"
              className="h-12 w-28 shrink-0 text-gray-200"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M2 46h116v2H2zM8 46V30h10v16zM22 46V22h3v-5h4v5h3v24zM38 46V26h12v20zM54 46V16h5V9l6-7 6 7v7h5v30zM78 46V24h10v22zM92 46V32h8v14zM104 46V28h9v18z" />
            </svg>
          </div>
        </div>
      </section>
      {/* ── Advertising plans ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {/* Heading + handwritten accent */}
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-3xl font-extrabold text-[#062B49] md:text-4xl">
                  Choose the Best <span className="text-[#F4B400]">Advertising Plan</span>
                </h2>
                <p className="mt-2 text-sm text-gray-500 sm:text-base">
                  Flexible &amp; affordable plans for every business type.
                </p>
              </div>
              <span
                aria-hidden="true"
                className="font-script hidden shrink-0 -rotate-3 text-2xl leading-tight text-[#062B49] xl:block"
              >
                Build Your Brand
                <br />
                in Patna<span className="text-[#EF4444]">♥</span>
              </span>
            </div>

            {/* Plan cards */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative flex flex-col rounded-2xl bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(6,43,73,0.14)] ${
                    plan.popular
                      ? 'pt-12 shadow-[0_16px_40px_rgba(6,43,73,0.16)] ring-2 ring-[#F4B400]'
                      : 'shadow-[0_10px_30px_rgba(6,43,73,0.07)] ring-1 ring-gray-100'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-1.5 rounded-t-2xl bg-[#F4B400] py-2 text-xs font-bold text-[#062B49]">
                      <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                      Most Popular
                    </div>
                  )}

                  {/* Plan head */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${plan.tile}`}
                    >
                      <plan.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-extrabold text-[#062B49]">{plan.name}</h3>
                      <p className="mt-0.5 text-[11px] leading-snug text-gray-500">{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#062B49]">{plan.price}</span>
                    <span className="text-sm text-gray-400">/month</span>
                  </div>

                  {/* Features */}
                  <ul className="mt-4 flex-1 space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-[13px] leading-snug text-gray-600"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#F4B400]"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link
                    href="/dashboard/billing"
                    className={`mt-5 block rounded-lg py-2.5 text-center text-sm font-bold transition ${
                      plan.popular
                        ? 'bg-[#F4B400] text-[#062B49] hover:bg-[#FFDF80]'
                        : 'border border-[#F4B400]/70 text-[#062B49] hover:bg-[#F4B400]/10'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          {/* ── Promo card ─────────────────────────────────────────── */}
          <aside className="relative overflow-hidden rounded-3xl bg-[#041F35]">
            <Image
              src="/images/patna-monument1.png"
              alt=""
              fill
              sizes="(min-width: 1024px) 320px, 100vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#041F35]/60 via-[#041F35]/85 to-[#041F35]" />

            <div className="relative flex h-full flex-col p-6">
              {/* "Your Business Here" pointer */}
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F4B400] px-4 py-2 text-xs font-bold text-[#062B49]">
                  Your Business Here
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <ArrowRight className="mr-3 mt-1 h-4 w-4 rotate-90 text-white/70" aria-hidden="true" />
              </div>

              {/* Mock business card */}
              <div className="mt-3 rounded-2xl bg-white p-3 shadow-2xl">
                <div className="flex gap-3">
                  <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src="/images/events-hero.png"
                      alt="Sample business"
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-extrabold text-[#062B49]">
                      Your Business
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
                      <span className="font-bold text-gray-800">5.0</span>
                      <span className="flex items-center gap-0.5" aria-hidden="true">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star key={i} className="h-3 w-3 fill-[#F4B400] text-[#F4B400]" />
                        ))}
                      </span>
                      <span>(124)</span>
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-gray-500">
                      Restaurant · Patna
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-end gap-1.5" aria-hidden="true">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-500">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50 text-blue-500">
                    <Heart className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* Copy */}
              <h3 className="mt-6 text-2xl font-extrabold leading-snug text-white">
                Get Noticed by Thousands of People in{' '}
                <span className="text-[#F4B400]">Patna</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">
                List, promote and grow your business with Patna Finder. Reach the right customers at
                the right time.
              </p>

              <Link
                href="/add-business"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#F4B400] px-6 py-3 text-sm font-bold text-[#062B49] transition hover:bg-[#FFDF80] lg:mt-auto lg:mb-0"
              >
                Start Advertising
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
      {/* ── How It Works + Why Advertise ─────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          {/* How It Works */}
          <div>
            <h2 className="text-2xl font-extrabold text-[#062B49] md:text-3xl">How It Works?</h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Get your business live in just 4 simple steps.
            </p>

            <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              {STEPS.map((step, index) => (
                <div key={step.title} className="flex flex-1 items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${step.badge}`}
                      >
                        {step.n}
                      </span>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#062B49] shadow-sm">
                        <step.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-bold text-[#062B49]">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-500">{step.desc}</p>
                  </div>

                  {index < STEPS.length - 1 && (
                    <ArrowRight
                      className="mx-3 mt-4 hidden h-5 w-5 shrink-0 text-gray-300 md:block"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Why Advertise with Us */}
          <div>
            <h2 className="text-2xl font-extrabold text-[#062B49] md:text-3xl">
              Why Advertise with Us?
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {WHY_ITEMS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition hover:shadow-[0_10px_25px_rgba(6,43,73,0.08)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF6DC] text-[#062B49]">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#062B49]">{item.title}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ── Final CTA band ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#041F35]">
        <Image
          src="/images/patna-monument1.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#041F35] via-[#041F35]/90 to-[#041F35]/70" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white md:text-3xl">
              Ready to Grow Your Business in Patna?
            </h2>
            <p className="mt-2 text-sm text-gray-300 sm:text-base">
              Your business deserves the right audience. Start advertising today!
            </p>
            <Link
              href="/add-business"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F4B400] px-7 py-3 text-sm font-bold text-[#062B49] transition hover:bg-[#FFDF80]"
            >
              Advertise Now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-6">
            {CTA_STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto h-6 w-6 text-[#F4B400]" aria-hidden="true" />
                <div className="mt-2 text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="mt-1 text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}








