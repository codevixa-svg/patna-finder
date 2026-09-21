'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUserAuthStore } from '@/store/userAuthStore';
import {
  GraduationCap,
  Stethoscope,
  Hospital,
  UtensilsCrossed,
  Coffee,
  Dumbbell,
  Scale,
  Trophy,
  ArrowRight,
} from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [bestOfPatnaOpen, setBestOfPatnaOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<'explore' | 'categories' | 'bestOfPatna' | null>(null);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useUserAuthStore();
  const pathname = usePathname();

  // The global header is transparent (white text) and overlays dark hero
  // sections. Pages that start with a light background (business details,
  // area pages and all blog pages) render a solid white sticky header with
  // dark text.
  const solid = Boolean(pathname && (pathname.startsWith('/business/') || pathname.startsWith('/areas') || pathname.startsWith('/blog')));

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the mobile menu on Escape and lock body scroll while it is open
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [mobileMenuOpen]);

  // Helpers used by the mobile drawer navigation
  const toggleMobileSubmenu = (key: 'explore' | 'categories' | 'bestOfPatna') => {
    setMobileSubmenu((cur) => (cur === key ? null : key));
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileSubmenu(null);
  };

  const navLinkClass = solid
    ? 'text-gray-700 hover:text-[#D89E00] font-medium transition'
    : 'text-white hover:text-[#F4B400] font-medium transition';

  const handleAddBusiness = (e: React.MouseEvent) => {
    e.preventDefault();
    if (mounted && isAuthenticated) {
      window.location.href = '/dashboard/add-business';
    } else {
      window.location.href = '/dashboard/login?redirect=/dashboard/add-business';
    }
  };

  return (
    <>
    <header
      className={
        solid
          ? 'sticky top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
          : 'absolute top-0 left-0 right-0 z-50 bg-transparent'
      }
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#F4B400] to-[#D89E00] rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className={`text-lg sm:text-xl font-extrabold truncate ${solid ? 'text-[#062B49]' : 'text-white'}`}>PATNA FINDER</div>
              <div className={`text-[10px] sm:text-xs -mt-0.5 hidden sm:block truncate ${solid ? 'text-gray-500' : 'text-gray-300'}`}>Discover Patna's Best</div>
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
                    <Link href="/explore/trending" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      Trending
                    </Link>
                    <Link href="/explore/recently-added" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      Recently Added
                    </Link>
                    <Link href="/explore/highest-rated" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      Highest Rated
                    </Link>
                    <Link href="/explore/hidden-gems" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
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
                    <Link href="/categories/coaching-institutes" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <GraduationCap className="w-4 h-4 text-[#D89E00] shrink-0" />
                      Coaching Institutes
                    </Link>
                    <Link href="/categories/doctors" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <Stethoscope className="w-4 h-4 text-[#D89E00] shrink-0" />
                      Doctors
                    </Link>
                    <Link href="/categories/dentists" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <svg className="w-4 h-4 text-[#D89E00] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.5C10.9 4.7 9.4 4 8 4 5.8 4 4 5.5 4 8c0 2.6 2 4.6 2.5 7 .3 1.8.5 4 2.5 4 1.5 0 1-2.5 3-2.5s1.5 2.5 3 2.5c2 0 2.2-2.2 2.5-4 .5-2.4 2.5-4.4 2.5-7 0-2.5-1.8-4-4-4-1.4 0-2.9.7-4 1.5z" />
                      </svg>
                      Dentists
                    </Link>
                    <Link href="/categories/hospitals" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <Hospital className="w-4 h-4 text-[#D89E00] shrink-0" />
                      Hospitals
                    </Link>
                    <Link href="/categories/restaurants" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <UtensilsCrossed className="w-4 h-4 text-[#D89E00] shrink-0" />
                      Restaurants
                    </Link>
                    <Link href="/categories/cafes" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <Coffee className="w-4 h-4 text-[#D89E00] shrink-0" />
                      Cafés
                    </Link>
                    <Link href="/categories/gyms" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <Dumbbell className="w-4 h-4 text-[#D89E00] shrink-0" />
                      Gyms
                    </Link>
                    <Link href="/categories/lawyers" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <Scale className="w-4 h-4 text-[#D89E00] shrink-0" />
                      Lawyers
                    </Link>
                    <Link href="/categories" className="flex items-center justify-between px-4 py-2 text-[#B58200] hover:bg-gray-50 font-semibold transition border-t border-gray-100 mt-2">
                      View All Categories
                      <ArrowRight className="w-4 h-4" />
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
                    <Link href="/best-of-patna/coaching" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <Trophy className="w-4 h-4 text-[#D89E00] shrink-0" />
                      Best Coaching
                    </Link>
                    <Link href="/best-of-patna/hospitals" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <Trophy className="w-4 h-4 text-[#D89E00] shrink-0" />
                      Best Hospitals
                    </Link>
                    <Link href="/best-of-patna/restaurants" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <Trophy className="w-4 h-4 text-[#D89E00] shrink-0" />
                      Best Restaurants
                    </Link>
                    <Link href="/best-of-patna/cafes" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <Trophy className="w-4 h-4 text-[#D89E00] shrink-0" />
                      Best Cafés
                    </Link>
                    <Link href="/best-of-patna/dentists" className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-[#D89E00] transition">
                      <Trophy className="w-4 h-4 text-[#D89E00] shrink-0" />
                      Best Dentists
                    </Link>
                    <Link href="/best-of-patna" className="flex items-center justify-between px-4 py-2 text-[#B58200] hover:bg-gray-50 font-semibold transition border-t border-gray-100 mt-2">
                      View All Awards
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <Link
              href="/blog"
              className={
                pathname === '/blog'
                  ? 'border-b-2 border-[#062B49] pb-0.5 font-semibold text-[#062B49]'
                  : navLinkClass
              }
            >
              Blogs
            </Link>
            <Link href="/about" className={navLinkClass}>
              About Us
            </Link>
          </div>

          {/* Add Business Button with + Icon */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/dashboard/add-business" onClick={handleAddBusiness} className="bg-[#F4B400] text-gray-900 px-6 py-2.5 rounded-xl font-bold hover:bg-[#D89E00] transition shadow-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Business
            </Link>
          </div>

          {/* Mobile: Add Business + menu button */}
          <div className="md:hidden flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/dashboard/add-business"
              onClick={handleAddBusiness}
              className="bg-[#F4B400] text-gray-900 pl-2 pr-2.5 sm:pl-2.5 sm:pr-3 py-2 rounded-full text-[10px] sm:text-[11px] font-bold flex items-center gap-1 shadow-md active:scale-95 transition whitespace-nowrap"
            >
              <span className="text-sm leading-none font-extrabold">+</span>
              <span className="hidden min-[420px]:inline">Add Business</span>
            </Link>
            <button
              className={`p-1.5 sm:p-2 -mr-1 ${solid ? 'text-gray-700' : 'text-white'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu — full-height drawer */}
</nav>
    </header>

    {/* Mobile drawer + backdrop — rendered outside the <header> element so it
        can anchor to the viewport on every page (sticky/backdrop-filter headers
        would otherwise trap position:fixed descendants). Hidden on md+. */}
    {mobileMenuOpen && (
      <>
        {/* Backdrop — tap anywhere outside the sheet to close */}
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/40 backdrop-blur-sm"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        {/* Drawer */}
        <div
          id="mobile-menu"
          className="fixed left-0 right-0 top-16 bottom-0 z-[45] md:hidden overflow-y-auto overscroll-contain"
        >
          <div className="bg-white min-h-full shadow-2xl px-4 sm:px-6 py-5 sm:py-6">
            <nav aria-label="Mobile navigation" className="space-y-1">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="flex items-center justify-between py-3 px-1 text-gray-700 hover:text-[#D89E00] font-medium border-b border-gray-100"
              >
                Home
              </Link>
{/* Explore accordion */}
              <div className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <Link href="/explore" onClick={closeMobileMenu} className="flex-1 py-3 px-1 text-gray-700 hover:text-[#D89E00] font-medium">
                    Explore
                  </Link>
                  <button
                    onClick={() => toggleMobileSubmenu('explore')}
                    aria-expanded={mobileSubmenu === 'explore'}
                    aria-label={mobileSubmenu === 'explore' ? 'Collapse Explore links' : 'Expand Explore links'}
                    className="p-2 text-gray-500"
                  >
                    <svg className={`w-5 h-5 transition-transform ${mobileSubmenu === 'explore' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {mobileSubmenu === 'explore' && (
                  <div className="pb-2 pl-2 space-y-1">
                    <Link href="/explore/trending" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Trending
                    </Link>
                    <Link href="/explore/recently-added" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Recently Added
                    </Link>
                    <Link href="/explore/highest-rated" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Highest Rated
                    </Link>
                    <Link href="/explore/hidden-gems" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Hidden Gems
                    </Link>
                  </div>
                )}
              </div>
{/* Categories accordion */}
              <div className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <Link href="/categories" onClick={closeMobileMenu} className="flex-1 py-3 px-1 text-gray-700 hover:text-[#D89E00] font-medium">
                    Categories
                  </Link>
                  <button
                    onClick={() => toggleMobileSubmenu('categories')}
                    aria-expanded={mobileSubmenu === 'categories'}
                    aria-label={mobileSubmenu === 'categories' ? 'Collapse Categories links' : 'Expand Categories links'}
                    className="p-2 text-gray-500"
                  >
                    <svg className={`w-5 h-5 transition-transform ${mobileSubmenu === 'categories' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {mobileSubmenu === 'categories' && (
                  <div className="pb-2 pl-2 space-y-1">
                    <Link href="/categories/coaching-institutes" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Coaching Institutes
                    </Link>
                    <Link href="/categories/doctors" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Doctors
                    </Link>
                    <Link href="/categories/dentists" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Dentists
                    </Link>
                    <Link href="/categories/hospitals" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Hospitals
                    </Link>
                    <Link href="/categories/restaurants" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Restaurants
                    </Link>
                    <Link href="/categories/gyms" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Gyms
                    </Link>
                    <Link href="/categories" onClick={closeMobileMenu} className="block py-2 px-2 text-sm font-semibold text-[#B58200] rounded-lg hover:bg-gray-50">
                      View All Categories
                    </Link>
                  </div>
                )}
              </div>
{/* Best Of Patna accordion */}
              <div className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <Link href="/best-of-patna" onClick={closeMobileMenu} className="flex-1 py-3 px-1 text-gray-700 hover:text-[#D89E00] font-medium">
                    Best Of Patna
                  </Link>
                  <button
                    onClick={() => toggleMobileSubmenu('bestOfPatna')}
                    aria-expanded={mobileSubmenu === 'bestOfPatna'}
                    aria-label={mobileSubmenu === 'bestOfPatna' ? 'Collapse Best Of Patna links' : 'Expand Best Of Patna links'}
                    className="p-2 text-gray-500"
                  >
                    <svg className={`w-5 h-5 transition-transform ${mobileSubmenu === 'bestOfPatna' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                {mobileSubmenu === 'bestOfPatna' && (
                  <div className="pb-2 pl-2 space-y-1">
                    <Link href="/best-of-patna/coaching" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Best Coaching
                    </Link>
                    <Link href="/best-of-patna/hospitals" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Best Hospitals
                    </Link>
                    <Link href="/best-of-patna/restaurants" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Best Restaurants
                    </Link>
                    <Link href="/best-of-patna/cafes" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Best Cafés
                    </Link>
                    <Link href="/best-of-patna/dentists" onClick={closeMobileMenu} className="block py-2 px-2 text-sm text-gray-600 hover:text-[#D89E00] rounded-lg hover:bg-gray-50">
                      Best Dentists
                    </Link>
                    <Link href="/best-of-patna" onClick={closeMobileMenu} className="block py-2 px-2 text-sm font-semibold text-[#B58200] rounded-lg hover:bg-gray-50">
                      View All Awards
                    </Link>
                  </div>
                )}
              </div>
<Link
                href="/blog"
                onClick={closeMobileMenu}
                className="block py-3 px-1 text-gray-700 hover:text-[#D89E00] font-medium border-b border-gray-100"
              >
                Blogs
              </Link>
              <Link
                href="/about"
                onClick={closeMobileMenu}
                className="block py-3 px-1 text-gray-700 hover:text-[#D89E00] font-medium border-b border-gray-100"
              >
                About Us
              </Link>

              {/* CTA */}
              <Link
                href="/dashboard/add-business"
                onClick={(e) => {
                  closeMobileMenu();
                  handleAddBusiness(e);
                }}
                className="mt-4 bg-[#F4B400] text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-[#D89E00] transition shadow-lg flex items-center gap-2 justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Business
              </Link>
            </nav>
          </div>
        </div>
      </>
    )}
    </>
  );
}
