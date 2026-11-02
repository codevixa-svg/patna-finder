import type { Metadata } from 'next';
import PrivacyContent from '@/components/PrivacyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Khojya collects, uses and protects your personal information when you use our platform.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return <PrivacyContent />;
}
