'use client';

import React, { useState, useEffect } from 'react';
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
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const title = festival.hero.title;
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex <= title.length) {
        setDisplayedTitle(title.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typingInterval);
      }
    }, 80); // Speed of typing (80ms per character)

    return () => clearInterval(typingInterval);
  }, [festival.hero.title]);

  // Function to split title for color highlighting (for default theme)
  const renderTitle = () => {
    const title = displayedTitle;
    
    // For default theme: highlight "Aapki Khoj" in yellow
    if (festival.name === 'Default' && title.includes('Aapki Khoj')) {
      const parts = title.split('Aapki Khoj');
      return (
        <>
          {parts[0]}
          <span className="text-yellow-400">Aapki Khoj</span>
          {parts[1]}
        </>
      );
    }
    
    return title;
  };

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
    <section className="relative text-white overflow-hidden min-h-[400px] md:min-h-[450px]">
      {/* Background Image (if provided) or Gradient */}
      {festival.hero.bgImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${festival.hero.bgImage})` }}
        >
          {/* Festival-specific Overlay for better text readability */}
          <div 
            className="absolute inset-0" 
            style={{ backgroundColor: festival.hero.overlayColor || 'rgba(0, 0, 0, 0.5)' }}
          ></div>
        </div>
      ) : (
        <div className={`absolute inset-0 ${gradientClass} animate-gradient-x`}></div>
      )}

      {/* Particle Animation Overlay */}
      <FestivalParticles festivalName={festival.name} />

      {/* Decorative Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 z-10">
        <div className="flex flex-col items-start text-left">
          {/* Text Content - Left Aligned */}
          <div className="max-w-3xl">
            {/* Title with Human-like Typewriter Effect */}
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 mt-8"
              style={{ opacity: 1 }}
            >
              <span className="inline-block">
                {renderTitle()}
                {!isTypingComplete && (
                  <span className="inline-block w-1 h-12 sm:h-14 md:h-16 bg-white ml-1 animate-blink align-middle"></span>
                )}
              </span>
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
              className="grid grid-cols-4 gap-4 mt-10 animate-fade-in-up"
              style={{ animationDelay: '0.8s', opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-bold mb-1">5000+</div>
                <div className="text-xs sm:text-sm text-white/80">Businesses</div>
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-bold mb-1">50+</div>
                <div className="text-xs sm:text-sm text-white/80">Categories</div>
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-bold mb-1">10K+</div>
                <div className="text-xs sm:text-sm text-white/80">Reviews</div>
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-bold mb-1">100K+</div>
                <div className="text-xs sm:text-sm text-white/80">Users</div>
              </div>
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
