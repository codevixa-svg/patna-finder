import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ExploreBrowser from '@/components/ExploreBrowser';
import {
  isValidExploreFilter,
  FILTER_LABELS,
} from '@/lib/explore-filters';

const DESCRIPTIONS: Record<string, string> = {
  trending: 'The most popular businesses in Patna right now',
  'highest-rated': 'Top-rated businesses loved by people across Patna',
  'recently-added': 'The newest businesses on Patna Finder',
  'hidden-gems': 'Underrated places, unique cafés and local secrets',
  featured: "Hand-picked favourites from the Patna Finder editors",
};

export function generateStaticParams() {
  return Object.keys(FILTER_LABELS).map((filter) => ({ filter }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ filter: string }>;
}): Promise<Metadata> {
  const { filter } = await params;
  const key = filter.toLowerCase();
  if (!isValidExploreFilter(key)) return { title: 'Explore' };

  const label = FILTER_LABELS[key];
  return {
    title: `${label} in Patna`,
    description: `${DESCRIPTIONS[key]}. Discover the best businesses on Patna Finder.`,
    alternates: { canonical: `/explore/${key}` },
  };
}

export default async function ExploreFilterPage({
  params,
}: {
  params: Promise<{ filter: string }>;
}) {
  const { filter } = await params;
  const key = filter.toLowerCase();
  if (!isValidExploreFilter(key)) notFound();

  const label = FILTER_LABELS[key];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">{label} in Patna</h1>
          <p className="text-xl text-gray-300">{DESCRIPTIONS[key]}</p>
        </div>
      </section>

      {/* Breadcrumb — same UI as the business details page */}
      <Breadcrumbs
        items={[{ label: 'Explore', href: '/explore' }, { label: `${label} in Patna` }]}
      />

      <ExploreBrowser initialFilter={key} />
    </main>
  );
}
