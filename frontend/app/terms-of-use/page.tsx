import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'The rules and guidelines for using Patna Finder — listings, reviews, business accounts and acceptable use.',
  alternates: { canonical: '/terms-of-use' },
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'Welcome to Patna Finder. By accessing or using patnafinder.com (the “Platform”), you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree with any part of these terms, please stop using the Platform.',
    ],
  },
  {
    title: '2. Eligibility & Accounts',
    body: [
      'You must be at least 13 years old to use Patna Finder. Business owner accounts require accurate registration details.',
      'You are responsible for keeping your account credentials confidential and for all activity that happens under your account.',
    ],
  },
  {
    title: '3. Business Listings',
    body: [
      'Business information submitted to the Platform must be accurate, lawful and not misleading. Listings submitted for review are placed in a pending state until approved by our team.',
      'We may edit, reject, suspend or remove any listing that violates these terms, is duplicated, inaccurate, or reported to us by the rightful owner.',
      'Claiming a business requires reasonable proof of ownership or authorisation. False ownership claims may result in permanent account suspension.',
    ],
  },
  {
    title: '4. Reviews & Ratings',
    body: [
      'Reviews must be based on genuine first-hand experience. Fake reviews, paid reviews, review swapping, or reviews intended to harm a competitor are strictly prohibited.',
      'We may remove content that is defamatory, hateful, obscene, invasive of privacy, or otherwise in violation of these terms, and suspend accounts that repeatedly violate review guidelines.',
    ],
  },
  {
    title: '5. Acceptable Use',
    body: [
      'You agree NOT to: scrape or harvest data from the Platform at scale; attempt to gain unauthorised access to our systems; interfere with the Platform’s operation; impersonate any person or business; or use the Platform for any unlawful purpose.',
    ],
  },
  {
    title: '6. Intellectual Property',
    body: [
      'The Platform’s design, branding, code and content are owned by Patna Finder or its licensors. Business owners retain ownership of the content they submit, but grant us a non-exclusive, worldwide licence to display it on the Platform.',
    ],
  },
  {
    title: '7. Advertising & Third-Party Content',
    body: [
      'Sponsored and featured placements are clearly labelled. We are not responsible for the products or services advertised by third parties on the Platform.',
    ],
  },
  {
    title: '8. Disclaimers',
    body: [
      'The Platform is provided on an “as is” and “as available” basis. While we work hard to keep listings accurate and up to date, we do not warrant that all information is complete, current, or error-free.',
      'Always verify critical details (such as medical, legal or financial advice) directly with the business before making decisions.',
    ],
  },
  {
    title: '9. Limitation of Liability',
    body: [
      'To the maximum extent permitted by law, Patna Finder shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of, or inability to use, the Platform.',
    ],
  },
  {
    title: '10. Termination',
    body: [
      'We may suspend or terminate your access to the Platform at any time, with or without notice, for conduct that we believe violates these terms or is harmful to other users or businesses.',
    ],
  },
  {
    title: '11. Governing Law',
    body: [
      'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Patna, Bihar.',
    ],
  },
  {
    title: '12. Changes to These Terms',
    body: [
      'We may revise these Terms of Use from time to time. Continued use of the Platform after changes are published constitutes acceptance of the revised terms.',
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Terms of Use</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The rules and guidelines for using Patna Finder.
          </p>
          <p className="text-sm text-gray-400 mt-4">Effective date: January 1, 2025</p>
        </div>
      </section>

      {/* Breadcrumb — same UI as the business details page */}
      <Breadcrumbs items={[{ label: 'Terms of Use' }]} />

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
              <div className="space-y-3">
                {section.body.map((para, i) => (
                  <p key={i} className="text-gray-600 leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
