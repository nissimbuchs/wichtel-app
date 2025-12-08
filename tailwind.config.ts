import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: {
            DEFAULT: '#c92a2a',
            light: '#fa5252',
            dark: '#a61e1e',
          },
          green: {
            DEFAULT: '#2f9e44',
            light: '#51cf66',
            dark: '#2b8a3e',
          },
          gold: {
            DEFAULT: '#f59f00',
            light: '#ffd43b',
            dark: '#e67700',
          },
          snow: '#f8f9fa',
          ice: '#e9ecef',
        },
        'christmas-red': {
          DEFAULT: '#c92a2a',
          light: '#fa5252',
          dark: '#a61e1e',
        },
        'christmas-red-light': '#fa5252',
        'christmas-red-dark': '#a61e1e',
        'christmas-green': {
          DEFAULT: '#2f9e44',
          light: '#51cf66',
          dark: '#2b8a3e',
        },
        'christmas-green-light': '#51cf66',
        'christmas-green-dark': '#2b8a3e',
        'christmas-gold': {
          DEFAULT: '#f59f00',
          light: '#ffd43b',
          dark: '#e67700',
        },
        'christmas-gold-light': '#ffd43b',
        'christmas-gold-dark': '#e67700',
        'christmas-snow': '#f8f9fa',
        'christmas-ice': '#e9ecef',
        organizer: {
          bg: '#fff3e0',
          border: '#ffe0b2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '12px',
        md: '16px',
        lg: '24px',
        xl: '40px',
      },
      boxShadow: {
        'christmas': '0 10px 30px -10px rgba(201, 42, 42, 0.3)',
        'glow': '0 0 20px rgba(255, 212, 59, 0.4)',
        'frost': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'frost-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.2)',
        'glow-red': '0 0 20px rgba(201, 42, 42, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 159, 0, 0.3)',
        'glow-green': '0 0 20px rgba(47, 158, 68, 0.3)',
        'inner-frost': 'inset 0 2px 8px 0 rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'frost-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(200,220,255,0.05) 100%)',
        'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
