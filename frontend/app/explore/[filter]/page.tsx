import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ExploreBrowser from '@/components/ExploreBrowser';
import {
  isValidExploreFilter,
  FILTER_LABELS,
} from '@/lib/explore-filters';

const DESCRIPTIONS: Record<string, string> = {
  all: 'Every business listed on Patna Finder — browse them all in one place',
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
    <main className="min-h-screen bg-[#F7F9FC]">
      {/* The hero renders inside ExploreBrowser (it owns the search state);
          this page only supplies the copy and the hero breadcrumb. */}
      <ExploreBrowser
        initialFilter={key}
        hero={{
          breadcrumb: (
            <Breadcrumbs
              variant="hero"
              items={[{ label: 'Explore', href: '/explore' }, { label: `${label} in Patna` }]}
            />
          ),
          title: (
            <>
              {label} in <span className="text-[#F4B400]">Patna</span>
            </>
          ),
          subtitle: DESCRIPTIONS[key],
        }}
      />
    </main>
  );
}
