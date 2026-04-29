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
        primary: '#1B3A2D',
        accent: '#D4A843',
        cream: '#F7F4EE',
        success: '#2D6A4F',
        danger: '#B91C1C',
        'text-dark': '#1A1A1A',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
