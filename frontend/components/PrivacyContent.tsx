'use client';

import {
  FileText,
  Database,
  Settings,
  Cookie,
  Share2,
  Archive,
  ShieldCheck,
  Globe,
  Baby,
  RefreshCw,
  Mail,
} from 'lucide-react';
import { LegalContent, type LegalSection } from './TermsContent';

const SECTIONS: LegalSection[] = [
  {
    id: 'introduction',
    title: '1. Introduction',
    icon: FileText,
    body: [
      'At Patna Finder, we value your privacy. This Privacy Policy explains how we collect, use, disclose and safeguard your information when you visit our platform.',
      'By using Patna Finder, you agree to the practices described in this policy. If you do not agree, please do not use the platform.',
    ],
  },
  {
    id: 'information-we-collect',
    title: '2. Information We Collect',
    icon: Database,
    body: [
      'Information you provide directly: your name, email address, phone number, and any details you submit when adding or claiming a business, writing a review, or contacting us.',
      'Business information: business name, category, address, contact details, opening hours, photos and descriptions submitted by business owners.',
      'Automatically collected information: device and browser details, IP address, pages visited and interaction events (such as calls and website clicks) used to improve the platform and provide business analytics.',
    ],
  },
  {
    id: 'how-we-use-information',
    title: '3. How We Use Information',
    icon: Settings,
    body: [
      'We use your information to provide and improve our services, verify business ownership, respond to enquiries, send important updates and personalise your experience.',
      'We also use aggregated, non-identifying data to measure platform performance and business engagement (views, calls, direction requests).',
    ],
  },
  {
    id: 'cookies-and-tracking',
    title: '4. Cookies and Tracking',
    icon: Cookie,
    body: [
      'We use cookies and similar technologies to enhance your browsing experience, analyse site traffic, and understand user preferences and behaviours.',
      'You can control cookies through your browser settings. Disabling essential cookies may affect sign-in and some platform features.',
    ],
  },
  {
    id: 'sharing-of-information',
    title: '5. Sharing of Information',
    icon: Share2,
    body: [
      'We do not sell your personal information. We only share data with service providers that help us operate the platform (hosting, email delivery, analytics) under confidentiality obligations, or when required by law.',
      'Business contact details you publish in a listing are, by nature of the platform, publicly visible.',
    ],
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
    icon: Archive,
    body: [
      'We retain personal information only as long as necessary for the purposes described in this policy, to comply with legal obligations, resolve disputes and enforce our agreements.',
    ],
  },
  {
    id: 'your-rights',
    title: '7. Your Rights',
    icon: ShieldCheck,
    body: [
      'You may request access to, correction of, or deletion of your personal information by contacting us. You may also ask us to remove a review or business submission you have made.',
      'Business owners may request removal of their listing by verified request.',
    ],
  },
  {
    id: 'third-party-services',
    title: '8. Third-Party Services',
    icon: Globe,
    body: [
      'The Platform may contain links to third-party websites and services (such as business websites or social media). We are not responsible for the privacy practices of those third parties.',
      'We encourage you to review the privacy policies of every third-party service you visit.',
    ],
  },
  {
    id: 'childrens-privacy',
    title: "9. Children's Privacy",
    icon: Baby,
    body: [
      'Patna Finder is not directed at children under 13, and we do not knowingly collect personal information from them. If you believe a child has provided us personal information, please contact us so we can delete it.',
    ],
  },
  {
    id: 'changes-to-this-policy',
    title: '10. Changes to This Policy',
    icon: RefreshCw,
    body: [
      'We may update this Privacy Policy from time to time. Material changes will be reflected on this page with an updated effective date. Continued use of the Platform after changes constitutes acceptance.',
    ],
  },
  {
    id: 'contact-us',
    title: '11. Contact Us',
    icon: Mail,
    body: [
      'Questions about this policy? Email us at hello@patnafinder.com or use the contact form on our Contact page — we aim to respond within 48 hours.',
    ],
  },
];

export default function PrivacyContent() {
  return (
    <LegalContent
      breadcrumbLabel="Privacy Policy"
      titleGold="Privacy"
      titleWhite="Policy"
      subtitle="Your privacy matters to us."
      tagline="Learn how we collect, use, and protect your information."
      helpText="If you have any questions about our Privacy Policy, we're here to help."
      readMoreLabel="Read Full Privacy Policy"
      sections={SECTIONS}
    />
  );
}
