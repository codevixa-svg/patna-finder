import type { Metadata } from 'next';
import Breadcrumbs from '@/components/Breadcrumbs';
import BestOfPatnaBrowser from '@/components/BestOfPatnaBrowser';

export const metadata: Metadata = {
  title: 'Best of Patna 2026 — Top-Rated Businesses, Voted by Locals | Patna Finder',
  description:
    'Celebrate the Best of Patna — the top-rated restaurants, cafés, hospitals, coaching centres, gyms and hotels, chosen by real reviews from the local community.',
};

export default function BestOfPatnaPage() {
  return (
    <main className="min-h-screen">
      <BestOfPatnaBrowser
        breadcrumb={
          <Breadcrumbs variant="hero" items={[{ label: 'Best Of Patna' }]} />
        }
      />
    </main>
  );
}
