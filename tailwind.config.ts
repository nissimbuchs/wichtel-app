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
      boxShadow: {
        'christmas': '0 10px 30px -10px rgba(201, 42, 42, 0.3)',
        'glow': '0 0 20px rgba(255, 212, 59, 0.4)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
