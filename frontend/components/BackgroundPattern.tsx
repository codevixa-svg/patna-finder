import React from 'react';

interface BackgroundPatternProps {
  pattern: 'diyas' | 'colors' | 'snowflakes' | 'fireworks' | 'tricolor' | 'default';
}

const BackgroundPattern: React.FC<BackgroundPatternProps> = ({ pattern }) => {
  switch (pattern) {
    case 'diyas':
      return <DiyaPattern />;
    case 'colors':
      return <HoliColorsPattern />;
    case 'snowflakes':
      return <SnowflakesPattern />;
    case 'fireworks':
      return <FireworksPattern />;
    case 'tricolor':
      return <TricolorPattern />;
    case 'default':
    default:
      return null;
  }
};

// Diwali - Diya pattern
const DiyaPattern: React.FC = () => {
  const diyas = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      {diyas.map((diya) => (
        <div
          key={diya.id}
          className="absolute text-4xl animate-pulse"
          style={{
            left: diya.left,
            top: diya.top,
            animationDelay: diya.delay,
            animationDuration: '2s',
          }}
        >
          🪔
        </div>
      ))}
    </div>
  );
};

// Holi - Colorful splashes
const HoliColorsPattern: React.FC = () => {
  const colors = ['#FF6B9D', '#C44569', '#FFA502', '#FFD700', '#00D2FF', '#9B59B6'];
  const splashes = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    color: colors[Math.floor(Math.random() * colors.length)],
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: `${50 + Math.random() * 100}px`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      {splashes.map((splash) => (
        <div
          key={splash.id}
          className="absolute rounded-full blur-xl"
          style={{
            left: splash.left,
            top: splash.top,
            width: splash.size,
            height: splash.size,
            backgroundColor: splash.color,
          }}
        />
      ))}
    </div>
  );
};

// Christmas - Falling snowflakes
const SnowflakesPattern: React.FC = () => {
  const snowflakes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${5 + Math.random() * 10}s`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
          }
        }
        .snowfall {
          animation: fall linear infinite;
        }
      `}</style>
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-3xl snowfall"
          style={{
            left: flake.left,
            animationDelay: flake.delay,
            animationDuration: flake.duration,
          }}
        >
          ❄️
        </div>
      ))}
    </div>
  );
};

// New Year - Fireworks bursts
const FireworksPattern: React.FC = () => {
  const bursts = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      <style jsx>{`
        @keyframes burst {
          0%, 100% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .burst {
          animation: burst 2s ease-in-out infinite;
        }
      `}</style>
      {bursts.map((burst) => (
        <div
          key={burst.id}
          className="absolute text-4xl burst"
          style={{
            left: burst.left,
            top: burst.top,
            animationDelay: burst.delay,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

// Independence Day - Tricolor pattern
const TricolorPattern: React.FC = () => {
  const stripes = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    color: i % 3 === 0 ? '#FF9933' : i % 3 === 1 ? '#FFFFFF' : '#138808',
    left: `${i * 12.5}%`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      {stripes.map((stripe) => (
        <div
          key={stripe.id}
          className="absolute h-full w-32 transform -rotate-45"
          style={{
            left: stripe.left,
            backgroundColor: stripe.color,
          }}
        />
      ))}
      {/* Ashoka Chakra elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-6xl opacity-30">⚙️</div>
      </div>
    </div>
  );
};

export default BackgroundPattern;
