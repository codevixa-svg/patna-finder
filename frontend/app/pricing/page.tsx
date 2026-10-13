import type { Metadata } from 'next';
import PricingContent from '@/components/PricingContent';

export const metadata: Metadata = {
  title: 'Pricing — Choose the Right Plan for Your Business',
  description:
    'Compare Patna Finder listing plans — Free Listing, Basic, Premium and Business Pro. Get more visibility, more customers and grow your business in Patna.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Pricing | Patna Finder',
    description:
      'Flexible listing plans for every business type in Patna — from a free business profile to Business Pro with homepage featuring, custom banner and SEO optimized profile.',
    type: 'website',
  },
};

export default function PricingPage() {
  return <PricingContent />;
}
