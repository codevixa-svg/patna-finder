'use client';

import Link from 'next/link';

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Simple Pricing</h1>
          <p className="text-xl text-gray-300">Choose a plan that works for your business</p>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Free */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-amber-400 transition">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Free</h3>
            <p className="text-gray-500 text-sm mb-6">Perfect to get started</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-gray-900">₹0</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {['1 business listing', 'Basic analytics', 'Community support', 'Standard listing placement'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard/register" className="block w-full py-3 text-center bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">
              Get Started Free
            </Link>
          </div>

          {/* Basic */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:border-amber-400 transition">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
            <p className="text-gray-500 text-sm mb-6">For small businesses</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-gray-900">₹499</span>
              <span className="text-gray-500">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {['Up to 3 business listings', 'Basic analytics', 'Email support', 'Standard listing placement', 'Business hours display'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard/billing" className="block w-full py-3 text-center bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition">
              Choose Basic
            </Link>
          </div>

          {/* Premium */}
          <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-8 text-white relative shadow-xl md:scale-105 md:z-10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-white text-gray-900 px-4 py-1 rounded-full text-xs font-bold">MOST POPULAR</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Premium</h3>
            <p className="text-amber-100 text-sm mb-6">Best for growing businesses</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold">₹999</span>
              <span className="text-amber-200">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {['Unlimited business listings', 'Advanced analytics', 'Featured on homepage', 'Priority support', 'Business hours display', 'Photo gallery support'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/dashboard/billing" className="block w-full py-3 text-center bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition">
              Choose Premium
            </Link>
          </div>
        </div>

        {/* Enterprise */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8 md:p-12 text-center border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
          <p className="text-gray-500 text-sm mb-4">For large organizations and franchises</p>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">Custom plans with dedicated account management, API access, bulk operations, and tailored solutions for your organization.</p>
          <a href="mailto:hello@patnafinder.com" className="inline-block px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition">
            Contact Sales
          </a>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I upgrade or downgrade anytime?', a: 'Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle.' },
              { q: 'Is there a free trial?', a: 'The Free plan is always available with no time limit. You can upgrade to Basic or Premium whenever you are ready.' },
              { q: 'What payment methods are accepted?', a: 'We accept UPI, Credit/Debit Cards, Net Banking, and popular wallets through our secure payment partner Razorpay.' },
              { q: 'How do I cancel my subscription?', a: 'You can cancel from your Dashboard > Billing page. Your plan will remain active until the end of the current billing period.' },
            ].map((faq) => (
              <div key={faq.q} className="bg-white rounded-xl border border-gray-200 p-5">
                <h4 className="font-semibold text-gray-900 mb-1">{faq.q}</h4>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
