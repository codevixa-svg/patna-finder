/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFC107',
        dark: '#081C3A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'bounce-slow': 'bounce 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'wave': 'wave 8s linear infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 
            'background-size': '200% 200%', 
            'background-position': 'left center' 
          },
          '50%': { 
            'background-size': '200% 200%', 
            'background-position': 'right center' 
          },
        },
        'fade-in-up': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        'float': {
          '0%, 100%': { 
            transform: 'translateY(0px)' 
          },
          '50%': { 
            transform: 'translateY(-20px)' 
          },
        },
        'wave': {
          '0%': { 
            transform: 'translateX(0)' 
          },
          '100%': { 
            transform: 'translateX(-50%)' 
          },
        },
      },
    },
  },
  plugins: [],
}
