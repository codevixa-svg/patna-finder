import type { Metadata } from 'next';
import TermsContent from '@/components/TermsContent';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'The rules and guidelines for using Patna Finder — listings, reviews, business accounts and acceptable use.',
  alternates: { canonical: '/terms-of-use' },
};

export default function TermsOfUsePage() {
  return <TermsContent />;
}

