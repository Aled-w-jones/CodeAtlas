/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './scripts/**/*.md'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#374151',
          850: '#1f2937',
          950: '#111827',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        green: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        purple: {
          400: '#a78bfa',
          500: '#8b5cf6',
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
        }
      },
      fontFamily: {
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
      }
    },
  },
  plugins: [],
};