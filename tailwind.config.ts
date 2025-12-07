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
          red: '#c92a2a',
          'red-light': '#fa5252',
          green: '#2f9e44',
          'green-light': '#51cf66',
          gold: '#f59f00',
          'gold-light': '#ffd43b',
        },
        organizer: {
          bg: '#fff3e0',
        },
      },
    },
  },
  plugins: [],
};

export default config;
