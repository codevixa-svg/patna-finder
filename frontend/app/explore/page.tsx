import Breadcrumbs from '@/components/Breadcrumbs';
import ExploreBrowser from '@/components/ExploreBrowser';

export const metadata = {
  title: 'Explore Patna',
  description: 'Discover the best businesses, trending places, and hidden gems in Patna.',
};

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Explore Patna</h1>
          <p className="text-xl text-gray-300">Discover the best businesses, trending places, and hidden gems</p>
        </div>
      </section>

      {/* Breadcrumb — same UI as the business details page */}
      <Breadcrumbs items={[{ label: 'Explore' }]} />

      <ExploreBrowser initialFilter="trending" />
    </main>
  );
}
