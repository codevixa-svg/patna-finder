import React from 'react';

interface IconProps {
  className?: string;
}

// Animated Diya/Lamp for Diwali
export const DiwaliIcon: React.FC<IconProps> = ({ className = "w-32 h-32" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="diya-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFA726" />
        <stop offset="100%" stopColor="#FF6F00" />
      </linearGradient>
      <linearGradient id="flame-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFD54F" />
        <stop offset="50%" stopColor="#FF9800" />
        <stop offset="100%" stopColor="#FF5722" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Diya Base */}
    <ellipse cx="50" cy="70" rx="30" ry="8" fill="url(#diya-gradient)" opacity="0.3" className="animate-pulse" />
    <path d="M30 60 Q30 55 35 55 L65 55 Q70 55 70 60 L68 70 Q68 72 65 72 L35 72 Q32 72 32 70 Z" fill="url(#diya-gradient)" />
    <ellipse cx="50" cy="55" rx="15" ry="3" fill="#D84315" />
    
    {/* Wick */}
    <rect x="48" y="45" width="4" height="10" fill="#6D4C41" rx="2" />
    
    {/* Animated Flame */}
    <g filter="url(#glow)">
      <path 
        d="M50 25 Q45 35 48 45 Q50 48 50 45 Q50 48 52 45 Q55 35 50 25 Z" 
        fill="url(#flame-gradient)" 
        className="animate-pulse"
        style={{ transformOrigin: '50px 45px' }}
      >
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1,1; 1.1,0.9; 1,1"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
    </g>
    
    {/* Sparkles */}
    <circle cx="30" cy="30" r="2" fill="#FFD700" className="animate-ping" style={{ animationDuration: '2s' }} />
    <circle cx="70" cy="35" r="2" fill="#FFD700" className="animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
    <circle cx="50" cy="20" r="2" fill="#FFD700" className="animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
  </svg>
);

// Animated Color Splash for Holi
export const HoliIcon: React.FC<IconProps> = ({ className = "w-32 h-32" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Color Powder Splashes */}
    <g className="animate-bounce" style={{ animationDuration: '2s' }}>
      <circle cx="50" cy="50" r="20" fill="#E91E63" opacity="0.7">
        <animate attributeName="r" values="20;22;20" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
    
    <g className="animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.3s' }}>
      <circle cx="35" cy="35" r="15" fill="#9C27B0" opacity="0.7">
        <animate attributeName="r" values="15;17;15" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
    
    <g className="animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.6s' }}>
      <circle cx="65" cy="35" r="15" fill="#2196F3" opacity="0.7">
        <animate attributeName="r" values="15;17;15" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
    
    <g className="animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.9s' }}>
      <circle cx="40" cy="65" r="12" fill="#FFEB3B" opacity="0.7">
        <animate attributeName="r" values="12;14;12" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
    
    <g className="animate-bounce" style={{ animationDuration: '2s', animationDelay: '1.2s' }}>
      <circle cx="60" cy="65" r="12" fill="#4CAF50" opacity="0.7">
        <animate attributeName="r" values="12;14;12" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </g>
    
    {/* Small dots */}
    <circle cx="25" cy="50" r="5" fill="#FF9800" opacity="0.8" className="animate-ping" style={{ animationDuration: '2s' }} />
    <circle cx="75" cy="50" r="5" fill="#FF5722" opacity="0.8" className="animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
    <circle cx="50" cy="25" r="5" fill="#00BCD4" opacity="0.8" className="animate-ping" style={{ animationDuration: '2s', animationDelay: '1s' }} />
    <circle cx="50" cy="75" r="5" fill="#8BC34A" opacity="0.8" className="animate-ping" style={{ animationDuration: '2s', animationDelay: '1.5s' }} />
  </svg>
);

// Animated Sun for Chhath Puja
export const ChhathIcon: React.FC<IconProps> = ({ className = "w-32 h-32" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sun-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFD54F" />
        <stop offset="100%" stopColor="#FF6F00" />
      </linearGradient>
      <filter id="sun-glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Rotating Rays */}
    <g filter="url(#sun-glow)" className="animate-spin" style={{ transformOrigin: '50px 40px', animationDuration: '20s' }}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line
          key={i}
          x1="50"
          y1="40"
          x2="50"
          y2="15"
          stroke="#FFA726"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${angle} 50 40)`}
          opacity="0.8"
        />
      ))}
    </g>
    
    {/* Sun Circle */}
    <circle cx="50" cy="40" r="18" fill="url(#sun-gradient)" filter="url(#sun-glow)">
      <animate attributeName="r" values="18;20;18" dur="3s" repeatCount="indefinite" />
    </circle>
    
    {/* Water Waves */}
    <g opacity="0.6">
      <path d="M10 70 Q20 65 30 70 T50 70 T70 70 T90 70" stroke="#2196F3" strokeWidth="2" fill="none">
        <animate attributeName="d" 
          values="M10 70 Q20 65 30 70 T50 70 T70 70 T90 70;M10 70 Q20 75 30 70 T50 70 T70 70 T90 70;M10 70 Q20 65 30 70 T50 70 T70 70 T90 70" 
          dur="3s" 
          repeatCount="indefinite" />
      </path>
      <path d="M10 78 Q20 73 30 78 T50 78 T70 78 T90 78" stroke="#2196F3" strokeWidth="2" fill="none">
        <animate attributeName="d" 
          values="M10 78 Q20 73 30 78 T50 78 T70 78 T90 78;M10 78 Q20 83 30 78 T50 78 T70 78 T90 78;M10 78 Q20 73 30 78 T50 78 T70 78 T90 78" 
          dur="3s" 
          repeatCount="indefinite"
          begin="0.5s" />
      </path>
      <path d="M10 86 Q20 81 30 86 T50 86 T70 86 T90 86" stroke="#2196F3" strokeWidth="2" fill="none">
        <animate attributeName="d" 
          values="M10 86 Q20 81 30 86 T50 86 T70 86 T90 86;M10 86 Q20 91 30 86 T50 86 T70 86 T90 86;M10 86 Q20 81 30 86 T50 86 T70 86 T90 86" 
          dur="3s" 
          repeatCount="indefinite"
          begin="1s" />
      </path>
    </g>
  </svg>
);

// Animated Christmas Tree
export const ChristmasIcon: React.FC<IconProps> = ({ className = "w-32 h-32" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Tree */}
    <path d="M50 10 L30 35 L35 35 L20 55 L28 55 L15 75 L85 75 L72 55 L80 55 L65 35 L70 35 Z" fill="#2E7D32" />
    
    {/* Tree Trunk */}
    <rect x="42" y="75" width="16" height="15" fill="#5D4037" rx="2" />
    
    {/* Twinkling Ornaments */}
    <circle cx="50" cy="25" r="3" fill="#FF1744" className="animate-pulse" style={{ animationDuration: '1.5s' }} />
    <circle cx="40" cy="40" r="3" fill="#FFD700" className="animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }} />
    <circle cx="60" cy="40" r="3" fill="#2196F3" className="animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }} />
    <circle cx="35" cy="55" r="3" fill="#FF1744" className="animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.9s' }} />
    <circle cx="65" cy="55" r="3" fill="#FFD700" className="animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '1.2s' }} />
    <circle cx="30" cy="68" r="3" fill="#2196F3" className="animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.5s' }} />
    <circle cx="70" cy="68" r="3" fill="#FF1744" className="animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.8s' }} />
    
    {/* Star on Top */}
    <g className="animate-pulse" style={{ animationDuration: '2s' }}>
      <path d="M50 5 L52 12 L59 12 L53 16 L55 23 L50 19 L45 23 L47 16 L41 12 L48 12 Z" fill="#FFD700" />
    </g>
    
    {/* Snowflakes */}
    <text x="15" y="25" fontSize="12" opacity="0.7" className="animate-ping" style={{ animationDuration: '3s' }}>❄</text>
    <text x="80" y="30" fontSize="10" opacity="0.7" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}>❄</text>
    <text x="20" y="50" fontSize="10" opacity="0.7" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }}>❄</text>
    <text x="85" y="60" fontSize="12" opacity="0.7" className="animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>❄</text>
  </svg>
);

// Animated Fireworks for New Year
export const NewYearIcon: React.FC<IconProps> = ({ className = "w-32 h-32" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="firework1">
        <stop offset="0%" stopColor="#E91E63" />
        <stop offset="100%" stopColor="#9C27B0" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="firework2">
        <stop offset="0%" stopColor="#2196F3" />
        <stop offset="100%" stopColor="#00BCD4" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="firework3">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FF9800" stopOpacity="0" />
      </radialGradient>
    </defs>
    
    {/* Firework Burst 1 */}
    <g className="animate-ping" style={{ animationDuration: '2s' }}>
      <circle cx="30" cy="30" r="15" fill="url(#firework1)" opacity="0.6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line
          key={i}
          x1="30"
          y1="30"
          x2="30"
          y2="15"
          stroke="#E91E63"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${angle} 30 30)`}
        />
      ))}
    </g>
    
    {/* Firework Burst 2 */}
    <g className="animate-ping" style={{ animationDuration: '2s', animationDelay: '0.7s' }}>
      <circle cx="70" cy="40" r="15" fill="url(#firework2)" opacity="0.6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line
          key={i}
          x1="70"
          y1="40"
          x2="70"
          y2="25"
          stroke="#2196F3"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${angle} 70 40)`}
        />
      ))}
    </g>
    
    {/* Firework Burst 3 */}
    <g className="animate-ping" style={{ animationDuration: '2s', animationDelay: '1.4s' }}>
      <circle cx="50" cy="65" r="15" fill="url(#firework3)" opacity="0.6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <line
          key={i}
          x1="50"
          y1="65"
          x2="50"
          y2="50"
          stroke="#FFD700"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${angle} 50 65)`}
        />
      ))}
    </g>
    
    {/* Stars */}
    <text x="15" y="60" fontSize="8" className="animate-pulse">✨</text>
    <text x="80" y="70" fontSize="8" className="animate-pulse" style={{ animationDelay: '0.5s' }}>✨</text>
    <text x="45" y="20" fontSize="8" className="animate-pulse" style={{ animationDelay: '1s' }}>✨</text>
  </svg>
);

// Animated Indian Flag for Independence Day
export const IndependenceDayIcon: React.FC<IconProps> = ({ className = "w-32 h-32" }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Flag Pole */}
    <rect x="15" y="15" width="4" height="75" fill="#8D6E63" />
    <circle cx="17" cy="15" r="4" fill="#FFD700" />
    
    {/* Flag with wave animation */}
    <g>
      <path d="M19 20 Q45 18 70 20 L70 32 Q45 34 19 32 Z" fill="#FF9933">
        <animate attributeName="d" 
          values="M19 20 Q45 18 70 20 L70 32 Q45 34 19 32 Z;M19 20 Q45 22 70 20 L70 32 Q45 30 19 32 Z;M19 20 Q45 18 70 20 L70 32 Q45 34 19 32 Z" 
          dur="3s" 
          repeatCount="indefinite" />
      </path>
      
      <path d="M19 32 Q45 34 70 32 L70 44 Q45 42 19 44 Z" fill="#FFFFFF">
        <animate attributeName="d" 
          values="M19 32 Q45 34 70 32 L70 44 Q45 42 19 44 Z;M19 32 Q45 30 70 32 L70 44 Q45 46 19 44 Z;M19 32 Q45 34 70 32 L70 44 Q45 42 19 44 Z" 
          dur="3s" 
          repeatCount="indefinite" />
      </path>
      
      <path d="M19 44 Q45 42 70 44 L70 56 Q45 58 19 56 Z" fill="#138808">
        <animate attributeName="d" 
          values="M19 44 Q45 42 70 44 L70 56 Q45 58 19 56 Z;M19 44 Q45 46 70 44 L70 56 Q45 54 19 56 Z;M19 44 Q45 42 70 44 L70 56 Q45 58 19 56 Z" 
          dur="3s" 
          repeatCount="indefinite" />
      </path>
    </g>
    
    {/* Ashoka Chakra */}
    <g className="animate-spin" style={{ transformOrigin: '44.5px 38px', animationDuration: '10s' }}>
      <circle cx="44.5" cy="38" r="6" fill="none" stroke="#000080" strokeWidth="0.8" />
      {[...Array(24)].map((_, i) => (
        <line
          key={i}
          x1="44.5"
          y1="38"
          x2="44.5"
          y2="32"
          stroke="#000080"
          strokeWidth="0.6"
          transform={`rotate(${i * 15} 44.5 38)`}
        />
      ))}
      <circle cx="44.5" cy="38" r="1" fill="#000080" />
    </g>
  </svg>
);
