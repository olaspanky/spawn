import type { Config } from "tailwindcss";
import daisyui from 'daisyui';

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          light: '#3b82f6', // blue-500
          dark: '#60a5fa',  // blue-400
        },
        orange: {
          600: '#FF5A1F', // Primary brand color
        }
      },
      fontFamily: {
        font1: ["var(--font-montserrat)", "sans-serif"],
        font2: ["var(--font-robo-slab)", "serif"],
      },

        keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    }
  },
  animation: {
    fadeIn: 'fadeIn 0.3s ease-in-out',
  },
    },
  },
  darkMode: 'class', // This enables the dark mode variant
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ],
  },} satisfies Config;
