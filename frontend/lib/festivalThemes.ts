export interface FestivalTheme {
  name: string;
  startDate: string; // MM-DD format
  endDate: string; // MM-DD format
  hero: {
    gradient: string; // Tailwind gradient classes
    title: string;
    emoji: string;
    subtitle: string;
    ctaText: string;
    bgPattern: 'diyas' | 'colors' | 'snowflakes' | 'fireworks' | 'tricolor' | 'default';
  };
}

export const festivals: FestivalTheme[] = [
  {
    name: 'Diwali',
    startDate: '10-20',
    endDate: '11-05',
    hero: {
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      title: 'दीपावली की शुभकामनाएं!',
      emoji: '🪔',
      subtitle: 'Discover trusted businesses and celebrate the festival of lights across Bihar',
      ctaText: 'Explore Diwali Offers',
      bgPattern: 'diyas',
    },
  },
  {
    name: 'Holi',
    startDate: '03-01',
    endDate: '03-15',
    hero: {
      gradient: 'from-pink-500 via-purple-500 to-blue-500',
      title: 'होली की रंगीन शुभकामनाएं!',
      emoji: '🎨',
      subtitle: 'Discover colorful businesses and celebrate the festival of colors across Bihar',
      ctaText: 'Explore Holi Specials',
      bgPattern: 'colors',
    },
  },
  {
    name: 'Chhath Puja',
    startDate: '10-25',
    endDate: '11-10',
    hero: {
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      title: 'छठ पूजा की शुभकामनाएं!',
      emoji: '🌅',
      subtitle: 'Discover trusted businesses and celebrate the great sun festival across Bihar',
      ctaText: 'Explore Chhath Offers',
      bgPattern: 'diyas',
    },
  },
  {
    name: 'Christmas',
    startDate: '12-15',
    endDate: '12-26',
    hero: {
      gradient: 'from-red-600 via-green-600 to-red-600',
      title: 'Merry Christmas!',
      emoji: '🎄',
      subtitle: 'Discover trusted businesses and celebrate the joy of Christmas across Bihar',
      ctaText: 'Explore Christmas Deals',
      bgPattern: 'snowflakes',
    },
  },
  {
    name: 'New Year',
    startDate: '12-27',
    endDate: '01-05',
    hero: {
      gradient: 'from-purple-600 via-pink-500 to-blue-500',
      title: 'Happy New Year 2025!',
      emoji: '🎉',
      subtitle: 'Discover trusted businesses and start the new year right across Bihar',
      ctaText: 'Explore New Year Offers',
      bgPattern: 'fireworks',
    },
  },
  {
    name: 'Independence Day',
    startDate: '08-10',
    endDate: '08-16',
    hero: {
      gradient: 'from-orange-500 via-white to-green-600',
      title: 'Happy Independence Day!',
      emoji: '🇮🇳',
      subtitle: 'Discover trusted businesses and celebrate the spirit of freedom across Bihar',
      ctaText: 'Explore Independence Offers',
      bgPattern: 'tricolor',
    },
  },
];

// Default theme when no festival is active
const defaultTheme: FestivalTheme = {
  name: 'Default',
  startDate: '01-01',
  endDate: '12-31',
  hero: {
    gradient: 'from-[#062B49] via-blue-700 to-[#062B49]',
    title: "Discover Patna's Best Businesses",
    emoji: '🏪',
    subtitle: 'Discover trusted businesses, popular places, and hidden gems across Bihar — all in one place.',
    ctaText: 'Start Exploring',
    bgPattern: 'default',
  },
};

/**
 * Check if a date falls within a festival's date range
 * Handles year-crossing festivals (e.g., New Year: Dec 27 - Jan 5)
 */
function isDateInRange(currentDate: Date, startDate: string, endDate: string): boolean {
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentDay = currentDate.getDate();
  
  const [startMonth, startDay] = startDate.split('-').map(Number);
  const [endMonth, endDay] = endDate.split('-').map(Number);
  
  // Convert to comparable numbers (MMDD format)
  const current = currentMonth * 100 + currentDay;
  const start = startMonth * 100 + startDay;
  const end = endMonth * 100 + endDay;
  
  // Normal range (doesn't cross year boundary)
  if (start <= end) {
    return current >= start && current <= end;
  }
  
  // Year-crossing range (e.g., Dec 27 - Jan 5)
  return current >= start || current <= end;
}

/**
 * Get the current active festival based on today's date
 * Returns the default theme if no festival is active
 */
export function getCurrentFestival(): FestivalTheme {
  // Check for environment variable override (for testing)
  if (typeof window !== 'undefined') {
    const forceFestival = process.env.NEXT_PUBLIC_FORCE_FESTIVAL;
    if (forceFestival) {
      const found = festivals.find(f => f.name.toLowerCase() === forceFestival.toLowerCase());
      if (found) return found;
    }
  }
  
  const today = new Date();
  
  // Find matching festival
  const activeFestival = festivals.find(festival => 
    isDateInRange(today, festival.startDate, festival.endDate)
  );
  
  return activeFestival || defaultTheme;
}

/**
 * Get a specific festival by name (useful for testing/preview)
 */
export function getFestivalByName(name: string): FestivalTheme {
  const found = festivals.find(f => f.name.toLowerCase() === name.toLowerCase());
  return found || defaultTheme;
}
