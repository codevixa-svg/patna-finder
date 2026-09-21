import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import ExploreBrowser from '@/components/ExploreBrowser';

export const metadata: Metadata = {
  title: 'Explore Patna',
  description:
    "Discover the best businesses, trending places, top-rated services and hidden gems across Patna — filter by category, area and rating.",
  alternates: { canonical: '/explore' },
};

/**
 * Explore landing page — server component so the SEO metadata stays static.
 * The hero (navy, left-aligned, bridge line-art + search bar) now renders
 * inside ExploreBrowser, because the search box shares state with the
 * filtering logic; this page only supplies the hero copy and the breadcrumb.
 */
export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#F7F9FC]">
      <ExploreBrowser
        initialFilter="trending"
        hero={{
          breadcrumb: <Breadcrumbs variant="hero" items={[{ label: 'Explore' }]} />,
          title: (
            <>
              Explore Businesses in <span className="text-[#F4B400]">Patna</span>
            </>
          ),
          subtitle:
            'Discover top restaurants, hospitals, coaching institutes, shops and more — all in one place.',
        }}
      />
    </main>
  );
}