import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Patna Finder collects, uses and protects your personal information when you use our platform.',
  alternates: { canonical: '/privacy-policy' },
};

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: '1. Introduction',
    body: [
      'Patna Finder (“we”, “our”, “us”) operates patnafinder.com, a local discovery platform for businesses in Patna, Bihar. This Privacy Policy explains what information we collect, how we use it, and the choices you have.',
      'By using Patna Finder, you agree to the practices described in this policy. If you do not agree, please do not use the platform.',
    ],
  },
  {
    title: '2. Information We Collect',
    body: [
      'Information you provide directly: your name, email address, phone number, and any details you submit when adding or claiming a business, writing a review, or contacting us.',
      'Business information: business name, category, address, contact details, opening hours, photos and descriptions submitted by business owners.',
      'Automatically collected information: device and browser details, IP address, pages visited and interaction events (such as calls and website clicks) used to improve the platform and provide business analytics.',
    ],
  },
  {
    title: '3. How We Use Information',
    body: [
      'To operate and improve the platform — displaying listings, reviews and search results.',
      'To verify business ownership and moderate submitted content.',
      'To communicate with you about your account, submissions, or support requests.',
      'To measure aggregated platform performance and business engagement (views, calls, direction requests).',
    ],
  },
  {
    title: '4. Reviews & Public Content',
    body: [
      'Reviews you publish are public and include your display name. Please do not include personal information about yourself or others in public content that you do not want visible.',
      'We may remove reviews that violate our Terms of Use or that we determine to be spam, fake, or abusive.',
    ],
  },
  {
    title: '5. Cookies & Analytics',
    body: [
      'We use essential cookies and local storage to keep you signed in, remember your preferences, and prevent duplicate event counting within a session.',
      'We may use privacy-respecting analytics tools to understand aggregate usage patterns. You can control cookies through your browser settings.',
    ],
  },
  {
    title: '6. Data Sharing',
    body: [
      'We do not sell your personal information. We only share data with service providers that help us operate the platform (hosting, email delivery, analytics) under confidentiality obligations, or when required by law.',
      'Business contact details you publish in a listing are, by nature of the platform, publicly visible.',
    ],
  },
  {
    title: '7. Data Security & Retention',
    body: [
      'We apply reasonable technical and organisational measures to protect your data. However, no method of transmission over the internet is 100% secure.',
      'We retain personal information only as long as necessary for the purposes described in this policy or as required by law.',
    ],
  },
  {
    title: '8. Your Rights',
    body: [
      'You may request access to, correction of, or deletion of your personal information by contacting us. You may also ask us to remove a review or business submission you have made.',
      'Business owners may request removal of their listing by verified request.',
    ],
  },
  {
    title: '9. Children’s Privacy',
    body: [
      'Patna Finder is not directed at children under 13, and we do not knowingly collect personal information from them.',
    ],
  },
  {
    title: '10. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. Material changes will be reflected on this page with an updated effective date.',
    ],
  },
  {
    title: '11. Contact Us',
    body: [
      'Questions about this policy? Email us at hello@patnafinder.com or use the contact form on our Contact page.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            How we collect, use and protect your information.
          </p>
          <p className="text-sm text-gray-400 mt-4">Effective date: January 1, 2025</p>
        </div>
      </section>

      {/* Breadcrumb — same UI as the business details page */}
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

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
