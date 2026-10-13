import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribe from Newsletter',
  description:
    'Unsubscribe from the Patna Finder newsletter. Stop receiving promotional emails, event updates and offers from Patna Finder anytime.',
  alternates: { canonical: '/unsubscribe' },
};

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
