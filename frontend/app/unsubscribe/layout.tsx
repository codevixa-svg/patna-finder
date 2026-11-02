import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unsubscribe from Newsletter',
  description:
    'Unsubscribe from the Khojya newsletter. Stop receiving promotional emails, event updates and offers from Khojya anytime.',
  alternates: { canonical: '/unsubscribe' },
};

export default function UnsubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
