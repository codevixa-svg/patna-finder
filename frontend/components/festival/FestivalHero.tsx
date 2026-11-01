'use client';

import React from 'react';
import Link from 'next/link';
import { getCurrentFestival } from '@/lib/festivalThemes';
import FestivalParticles from './FestivalParticles';
import { 
  DiwaliIcon, 
  HoliIcon, 
  ChhathIcon, 
  ChristmasIcon, 
  NewYearIcon, 
  IndependenceDayIcon 
} from './FestivalIcons';

const FestivalHero: React.FC = () => {
  const festival = getCurrentFestival();

  // Select the appropriate icon component
  const getIconComponent = () => {
    switch (festival.name) {
      case 'Diwali':
        return <DiwaliIcon className="w-24 h-24 sm:w-32 sm:h-32 transition-transform hover:scale-110 duration-300" />;
      case 'Holi':
        return <HoliIcon className="w-24 h-24 sm:w-32 sm:h-32 transition-transform hover:scale-110 duration-300" />;
      case 'Chhath Puja':
        return <ChhathIcon className="w-24 h-24 sm:w-32 sm:h-32 transition-transform hover:scale-110 duration-300" />;
      case 'Christmas':
        return <ChristmasIcon className="w-24 h-24 sm:w-32 sm:h-32 transition-transform hover:scale-110 duration-300" />;
      case 'New Year':
        return <NewYearIcon className="w-24 h-24 sm:w-32 sm:h-32 transition-transform hover:scale-110 duration-300" />;
      case 'Independence Day':
        return <IndependenceDayIcon className="w-24 h-24 sm:w-32 sm:h-32 transition-transform hover:scale-110 duration-300" />;
      default:
        return (
          <div className="w-24 h-24 sm:w-32 sm:h-32 text-6xl sm:text-8xl transition-transform hover:scale-110 duration-300">
            {festival.hero.emoji}
          </div>
        );
    }
  };

  // Festival-specific gradient classes
  const gradientClass = `bg-gradient-to-br ${festival.hero.gradient}`;

  return (
    <section className="relative text-white overflow-hidden min-h-[500px] md:min-h-[600px]">
      {/* Animated Gradient Background */}
      <div className={`absolute inset-0 ${gradientClass} animate-gradient-x`}></div>

      {/* Particle Animation Overlay */}
      <FestivalParticles festivalName={festival.name} />

      {/* Decorative Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Side - Text Content */}
          <div className="flex-1 max-w-2xl text-center md:text-left">
            {/* Festival Icon */}
            <div className="mb-6 flex justify-center md:justify-start animate-fade-in-up">
              {getIconComponent()}
            </div>

            {/* Title with Animation */}
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 animate-fade-in-up"
              style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
            >
              {festival.hero.title}
            </h1>

            {/* Subtitle with Animation */}
            <p 
              className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-up"
              style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}
            >
              {festival.hero.subtitle}
            </p>

            {/* CTA Button with Glow Effect */}
            <div 
              className="animate-fade-in-up"
              style={{ animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}
            >
              <Link 
                href="/businesses"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                {/* Button Glow Effect on Hover */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                
                <span className="relative">{festival.hero.ctaText}</span>
                
                <svg 
                  className="relative w-6 h-6 transition-transform group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Stats Row */}
            <div 
              className="grid grid-cols-4 gap-4 mt-12 animate-fade-in-up"
              style={{ animationDelay: '0.8s', opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">5000+</div>
                <div className="text-xs sm:text-sm text-white/80">Businesses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">50+</div>
                <div className="text-xs sm:text-sm text-white/80">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">10K+</div>
                <div className="text-xs sm:text-sm text-white/80">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">100K+</div>
                <div className="text-xs sm:text-sm text-white/80">Users</div>
              </div>
            </div>
          </div>

          {/* Right Side - Decorative Floating Elements */}
          <div className="hidden md:block relative w-64 h-64 lg:w-80 lg:h-80">
            {/* Floating Emoji Decorations */}
            <div className="absolute top-0 left-0 text-6xl opacity-60 animate-float">
              {festival.hero.emoji}
            </div>
            <div 
              className="absolute top-20 right-0 text-5xl opacity-50 animate-float" 
              style={{ animationDelay: '0.5s' }}
            >
              {festival.hero.emoji}
            </div>
            <div 
              className="absolute bottom-10 left-10 text-7xl opacity-70 animate-float" 
              style={{ animationDelay: '1s' }}
            >
              {festival.hero.emoji}
            </div>
            <div 
              className="absolute bottom-0 right-10 text-4xl opacity-40 animate-float" 
              style={{ animationDelay: '1.5s' }}
            >
              {festival.hero.emoji}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Decoration */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg 
          className="relative block w-full h-24" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
            </linearGradient>
          </defs>
          <path 
            d="M0,0 L0,60 Q300,90 600,60 T1200,60 L1200,0 Z" 
            fill="url(#wave-gradient)"
            className="animate-wave"
          >
            <animate
              attributeName="d"
              values="M0,0 L0,60 Q300,90 600,60 T1200,60 L1200,0 Z;M0,0 L0,60 Q300,30 600,60 T1200,60 L1200,0 Z;M0,0 L0,60 Q300,90 600,60 T1200,60 L1200,0 Z"
              dur="8s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
    </section>
  );
};

export default FestivalHero;
