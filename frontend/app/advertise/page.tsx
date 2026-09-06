import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Advertise With Us',
  description:
    'Reach thousands of local customers in Patna — featured listings, homepage spotlights, category sponsorships and banner ads on Patna Finder.',
  alternates: { canonical: '/advertise' },
};

const STATS = [
  { value: '100K+', label: 'Monthly page views' },
  { value: '1,200+', label: 'Businesses listed' },
  { value: '20+', label: 'Local categories' },
  { value: '50+', label: 'Patna areas covered' },
];

const PLANS = [
  {
    name: 'Featured Listing',
    price: '₹999',
    period: '/month',
    tagline: 'Stand out in search & category pages',
    features: [
      'Highlighted card with Featured badge',
      'Top placement in category results',
      'Photo gallery on your profile',
      'Click & call tracking dashboard',
      'Weekly performance summary',
    ],
    cta: 'Get Featured',
    featured: false,
  },
  {
    name: 'Homepage Spotlight',
    price: '₹2,499',
    period: '/month',
    tagline: 'Be seen first, right on the homepage',
    features: [
      'Everything in Featured Listing',
      'Homepage trending carousel slot',
      'Social media shout-out every month',
      'Editor’s Picks consideration',
      'Dedicated account manager',
    ],
    cta: 'Book Spotlight',
    featured: true,
  },
  {
    name: 'Category Sponsor',
    price: '₹4,999',
    period: '/month',
    tagline: 'Own an entire category in Patna',
    features: [
      'Everything in Homepage Spotlight',
      'Sponsored banner on category pages',
      'Exclusive “Sponsored” placement tile',
      'Blog feature in Patna Pulse',
      'Quarterly performance review call',
    ],
    cta: 'Sponsor a Category',
    featured: false,
  },
];

const FORMATS = [
  {
    title: 'Sponsored Listings',
    text: 'Your business card pinned to the top of relevant search and category results with a clear Sponsored label.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Display Banners',
    text: 'Eye-catching banners across high-traffic pages — homepage, category pages and blog articles.',
    icon: 'M4 5h16M4 12h16M4 19h10',
  },
  {
    title: 'Patna Pulse Features',
    text: 'A native editorial write-up about your business in our Patna Pulse blog, shared with our readers.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
  },
  {
    title: 'Event Collaborations',
    text: 'Promote launches, offers and events through dedicated event listings and push-style highlights.',
    icon: 'M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  },
];

export default function AdvertisePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Advertise With Us</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Put your business in front of thousands of customers actively searching in Patna.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-extrabold text-amber-400">{s.value}</div>
                <div className="text-sm text-gray-300 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Breadcrumb — same UI as the business details page */}
      <Breadcrumbs items={[{ label: 'Advertise' }]} />

      {/* Plans */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-3">
          Advertising Options
        </h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Simple, transparent pricing. All plans include real-time click & call tracking.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col relative ${
                plan.featured
                  ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-xl md:scale-105 md:z-10'
                  : 'bg-white border-2 border-gray-200 hover:border-amber-400 transition'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-gray-900 px-4 py-1 rounded-full text-xs font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}
              <h3 className={`text-xl font-bold mb-2 ${plan.featured ? '' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mb-6 ${plan.featured ? 'text-amber-100' : 'text-gray-500'}`}>
                {plan.tagline}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className={plan.featured ? 'text-amber-200' : 'text-gray-500'}>{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.featured ? 'text-white' : 'text-gray-600'}`}>
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className={`block w-full py-3 text-center font-semibold rounded-xl transition ${
                  plan.featured
                    ? 'bg-white text-amber-600 hover:bg-amber-50'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Formats */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-12">
            Ways to Promote
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FORMATS.map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-7 hover:shadow-lg transition">
                <div className="w-12 h-12 bg-amber-400/15 text-amber-500 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#081C3A] rounded-3xl p-10 md:p-14 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Tell us about your goals and we will build a custom package that fits your budget.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="bg-amber-400 text-gray-900 px-8 py-3.5 rounded-xl font-bold hover:bg-amber-500 transition shadow-lg"
            >
              Talk to Our Team
            </Link>
            <Link
              href="/pricing"
              className="bg-white/10 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-white/20 transition border border-white/20"
            >
              See Listing Plans
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}


