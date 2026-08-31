import Link from 'next/link';

export const metadata = {
  title: 'About Us - Patna Finder',
  description: 'Learn about Patna Finder - your premium local discovery platform',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#081C3A] to-[#144272] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">About Patna Finder</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your premium local discovery platform for finding the best businesses in Patna
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Patna Finder is not just another business directory. We're a premium local discovery platform 
              designed to help people find, compare, and choose the best businesses in Patna.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              We believe in quality over quantity, trust over transactions, and discovery over mere listing. 
              Our platform combines modern design with comprehensive features to deliver an exceptional 
              experience for both users and businesses.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Whether you're looking for the best coaching institute, a trusted dentist, or a hidden gem café, 
              Patna Finder is your go-to platform for authentic reviews and verified information.
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-3xl p-12 text-center">
            <div className="text-8xl mb-6">🏛️</div>
            <h3 className="text-2xl font-bold text-gray-900">Proudly Serving Patna</h3>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-center mb-12">What Makes Us Different</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-3">Premium Design</h3>
              <p className="text-gray-600">
                Modern, minimal, and smooth experience inspired by world-class platforms like Airbnb and Stripe.
              </p>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold mb-3">Verified Businesses</h3>
              <p className="text-gray-600">
                We verify businesses to ensure you get accurate information and trusted services.
              </p>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold mb-3">Real Reviews</h3>
              <p className="text-gray-600">
                Authentic reviews from real customers to help you make informed decisions.
              </p>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-xl font-bold mb-3">Hidden Gems</h3>
              <p className="text-gray-600">
                Discover underrated places and unique experiences you won't find elsewhere.
              </p>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-3">Smart Comparisons</h3>
              <p className="text-gray-600">
                Compare businesses side-by-side to find the perfect match for your needs.
              </p>
            </div>
            <div className="card text-center">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-3">Mobile First</h3>
              <p className="text-gray-600">
                Fully responsive design that works beautifully on all devices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-extrabold text-center mb-12">By The Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-5xl font-extrabold text-amber-500 mb-2">500+</div>
            <div className="text-gray-600">Cities Covered</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-extrabold text-amber-500 mb-2">10k+</div>
            <div className="text-gray-600">Businesses Listed</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-extrabold text-amber-500 mb-2">100k+</div>
            <div className="text-gray-600">Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-extrabold text-amber-500 mb-2">1M+</div>
            <div className="text-gray-600">Monthly Visitors</div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-gradient-to-br from-amber-400 to-amber-500 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-gray-900">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">🎯 Quality First</h3>
              <p className="text-gray-700">
                We prioritize quality over quantity. Every business listing is carefully reviewed to maintain 
                high standards.
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">🤝 Trust & Transparency</h3>
              <p className="text-gray-700">
                We believe in building trust through verified information, authentic reviews, and transparent 
                business practices.
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">💡 Innovation</h3>
              <p className="text-gray-700">
                We constantly innovate to provide better features, smoother experiences, and more value to 
                our users.
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">❤️ Community Focus</h3>
              <p className="text-gray-700">
                We're committed to supporting local businesses and helping our community discover the best 
                Patna has to offer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Join Our Community</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Whether you're looking for services or listing your business, we're here to help you succeed.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/explore" className="btn-primary">
            Explore Businesses
          </Link>
          <Link href="/add-business" className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition">
            List Your Business
          </Link>
        </div>
      </section>
    </main>
  );
}
