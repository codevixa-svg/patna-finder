import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import ClaimForm from './ClaimForm';

export const metadata: Metadata = {
  title: 'Claim Your Business',
  description:
    'Already listed on Patna Finder? Claim your business profile to update details, respond to reviews and unlock owner tools.',
  alternates: { canonical: '/claim-business' },
};

const STEPS = [
  {
    step: '1',
    title: 'Find Your Listing',
    text: 'Search Patna Finder for your business. If it is already listed, you can claim it in minutes.',
  },
  {
    step: '2',
    title: 'Verify Ownership',
    text: 'Share a few details — phone, email or registration proof — so we can confirm you own the business.',
  },
  {
    step: '3',
    title: 'Take Control',
    text: 'Once verified, update your profile, add photos, respond to reviews and track performance.',
  },
];

const BENEFITS = [
  'Update business information anytime',
  'Add photos, services & opening hours',
  'Respond to customer reviews publicly',
  'Verified business badge on your profile',
  'View views, calls & engagement analytics',
  'Priority placement opportunities',
];

export default function ClaimBusinessPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            Free for business owners
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Claim Your Business</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Already on Patna Finder? Take ownership of your profile and make it work for you.
          </p>
        </div>
      </section>

      {/* Breadcrumb — same UI as the business details page */}
      <Breadcrumbs items={[{ label: 'Claim Your Business' }]} />

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-12">
          How Claiming Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.step} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 relative">
              <div className="w-12 h-12 bg-amber-400 text-gray-900 rounded-xl flex items-center justify-center text-xl font-extrabold mb-5">
                {s.step}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits + Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Claim Request Form</h2>
            <p className="text-gray-600 mb-8">
              Tell us about your business — we usually verify ownership within 1–2 business days.
            </p>
            <ClaimForm />
          </div>

          <aside className="space-y-6">
            <div className="bg-[#081C3A] text-white rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-5">What You Get</h3>
              <ul className="space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-8 text-gray-900">
              <h3 className="text-xl font-bold mb-2">Not Listed Yet?</h3>
              <p className="text-sm text-gray-800 mb-5">
                Add your business for free and appear in front of thousands of local customers.
              </p>
              <Link
                href="/add-business"
                className="inline-block bg-[#081C3A] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0d2a55] transition"
              >
                Add Business Free
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
