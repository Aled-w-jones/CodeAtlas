/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './scripts/**/*.md'
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          750: '#374151',
        }
      },
      fontFamily: {
        mono: ['Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
};