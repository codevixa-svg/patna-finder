'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUserAuthStore } from '@/store/userAuthStore';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [bestOfPatnaOpen, setBestOfPatnaOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useUserAuthStore();
  const pathname = usePathname();

  // The global header is transparent (white text) and overlays dark hero
  // sections. Business detail pages start with a light background, so there we
  // render a solid white sticky header with dark text instead.
  const solid = pathname?.startsWith('/business/') ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinkClass = solid
    ? 'text-gray-700 hover:text-amber-500 font-medium transition'
    : 'text-white hover:text-amber-400 font-medium transition';

  const handleAddBusiness = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mounted && isAuthenticated) {
      window.location.href = '/dashboard/add-business';
    } else {
      window.location.href = '/dashboard/login?redirect=/dashboard/add-business';
    }
  };

  return (
    <header
      className={
        solid
          ? 'sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
          : 'absolute top-0 left-0 right-0 z-50 bg-transparent'
      }
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className={`text-xl font-extrabold ${solid ? 'text-[#153b78]' : 'text-white'}`}>PATNA FINDER</div>
              <div className={`text-xs -mt-1 ${solid ? 'text-gray-500' : 'text-gray-300'}`}>Discover Patna's Best</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={navLinkClass}>
              Home
            </Link>
            
            {/* Explore Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setExploreOpen(true)}
              onMouseLeave={() => setExploreOpen(false)}
            >
              <button className={`${navLinkClass} flex items-center gap-1`}>
                Explore
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {exploreOpen && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="bg-white rounded-xl shadow-lg py-2 w-48">
                    <Link href="/explore/trending" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      Trending
                    </Link>
                    <Link href="/explore/recently-added" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      Recently Added
                    </Link>
                    <Link href="/explore/highest-rated" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      Highest Rated
                    </Link>
                    <Link href="/explore/hidden-gems" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      Hidden Gems
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Categories Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button className={`${navLinkClass} flex items-center gap-1`}>
                Categories
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {categoriesOpen && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="bg-white rounded-xl shadow-lg py-2 w-56 max-h-96 overflow-y-auto">
                    <Link href="/categories/coaching-institutes" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      📚 Coaching Institutes
                    </Link>
                    <Link href="/categories/doctors" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      🩺 Doctors
                    </Link>
                    <Link href="/categories/dentists" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      🦷 Dentists
                    </Link>
                    <Link href="/categories/hospitals" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      🏥 Hospitals
                    </Link>
                    <Link href="/categories/restaurants" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      🍽️ Restaurants
                    </Link>
                    <Link href="/categories/cafes" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      ☕ Cafés
                    </Link>
                    <Link href="/categories/gyms" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      💪 Gyms
                    </Link>
                    <Link href="/categories/lawyers" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      ⚖️ Lawyers
                    </Link>
                    <Link href="/categories" className="block px-4 py-2 text-amber-600 hover:bg-gray-50 font-semibold transition border-t border-gray-100 mt-2">
                      View All Categories →
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Best of Patna Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setBestOfPatnaOpen(true)}
              onMouseLeave={() => setBestOfPatnaOpen(false)}
            >
              <button className={`${navLinkClass} flex items-center gap-1`}>
                Best Of Patna
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {bestOfPatnaOpen && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="bg-white rounded-xl shadow-lg py-2 w-56">
                    <Link href="/best-of-patna/coaching" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      🏆 Best Coaching
                    </Link>
                    <Link href="/best-of-patna/hospitals" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      🏆 Best Hospitals
                    </Link>
                    <Link href="/best-of-patna/restaurants" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      🏆 Best Restaurants
                    </Link>
                    <Link href="/best-of-patna/cafes" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      🏆 Best Cafés
                    </Link>
                    <Link href="/best-of-patna/dentists" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-amber-500 transition">
                      🏆 Best Dentists
                    </Link>
                    <Link href="/best-of-patna" className="block px-4 py-2 text-amber-600 hover:bg-gray-50 font-semibold transition border-t border-gray-100 mt-2">
                      View All Awards →
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <Link href="/blog" className={navLinkClass}>
              Blog
            </Link>
            <Link href="/about" className={navLinkClass}>
              About Us
            </Link>
          </div>

          {/* Add Business Button with + Icon */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard/add-business" onClick={handleAddBusiness} className="bg-amber-400 text-gray-900 px-6 py-2.5 rounded-xl font-bold hover:bg-amber-500 transition shadow-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Business
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 ${solid ? 'text-gray-700' : 'text-white'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 bg-white/95 backdrop-blur-md rounded-2xl mt-2 px-4">
            <Link href="/" className="block py-2 text-gray-700 hover:text-amber-500 font-medium">
              Home
            </Link>
            <Link href="/explore" className="block py-2 text-gray-700 hover:text-amber-500 font-medium">
              Explore
            </Link>
            <Link href="/categories" className="block py-2 text-gray-700 hover:text-amber-500 font-medium">
              Categories
            </Link>
            <Link href="/best-of-patna" className="block py-2 text-gray-700 hover:text-amber-500 font-medium">
              Best Of Patna
            </Link>
            <Link href="/blog" className="block py-2 text-gray-700 hover:text-amber-500 font-medium">
              Blog
            </Link>
            <Link href="/about" className="block py-2 text-gray-700 hover:text-amber-500 font-medium">
              About Us
            </Link>
            <Link href="/dashboard/add-business" onClick={handleAddBusiness} className="bg-amber-400 text-gray-900 px-6 py-2.5 rounded-xl font-bold hover:bg-amber-500 transition shadow-lg flex items-center gap-2 justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Business
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
