import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Patna Finder team — questions, feedback, partnerships or support, we would love to hear from you.',
  alternates: { canonical: '/contact' },
};

const CONTACT_CARDS = [
  {
    title: 'Email Us',
    lines: ['hello@patnafinder.com', 'support@patnafinder.com'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 9.409a2.25 2.25 0 0 1-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
  {
    title: 'Visit Us',
    lines: ['Patna Finder', 'Patna, Bihar, India'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.2" />
      </svg>
    ),
  },
  {
    title: 'Working Hours',
    lines: ['Mon – Sat: 10:00 AM – 6:00 PM', 'Sunday: Closed'],
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="8.5" />
        <path strokeLinecap="round" d="M12 7v5l3.5 2" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Questions, feedback, partnerships or support — we would love to hear from you.
          </p>
        </div>
      </section>

      {/* Breadcrumb — same UI as the business details page */}
      <Breadcrumbs items={[{ label: 'Contact' }]} />

      {/* Contact Info Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-24 relative z-10">
          {CONTACT_CARDS.map((card) => (
            <div key={card.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
              <div className="w-14 h-14 bg-amber-400/15 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {card.icon}
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h2>
              {card.lines.map((line) => (
                <p key={line} className="text-sm text-gray-600">
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Form + Side Info */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Send Us a Message</h2>
            <p className="text-gray-600 mb-8">
              Fill the form below and our team will get back to you within 24–48 hours.
            </p>
            <ContactForm />
          </div>

          <aside className="space-y-6">
            {/* FAQ quick links */}
            <div className="bg-[#081C3A] text-white rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-4">Quick Answers</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>
                  <a href="mailto:hello@patnafinder.com" className="hover:text-amber-400 transition">
                    How do I list my business on Patna Finder?
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@patnafinder.com" className="hover:text-amber-400 transition">
                    How long does the verification process take?
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@patnafinder.com" className="hover:text-amber-400 transition">
                    How do I report incorrect business information?
                  </a>
                </li>
              </ul>
              <p className="text-xs text-gray-400 mt-6">
                For anything urgent, email us directly and we will prioritise your request.
              </p>
            </div>

            {/* Business owners CTA */}
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-8 text-gray-900">
              <h3 className="text-xl font-bold mb-2">Own a Business?</h3>
              <p className="text-sm text-gray-800 mb-5">
                List your business for free and reach thousands of customers across Patna.
              </p>
              <a
                href="/add-business"
                className="inline-block bg-[#081C3A] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0d2a55] transition"
              >
                Add Your Business
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
