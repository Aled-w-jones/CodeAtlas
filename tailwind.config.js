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
        // VS Code Dark+ theme inspired palette
        'vsc-bg-dark': '#1E1E1E',
        'vsc-bg-medium': '#252526', // For sidebars, status bars
        'vsc-bg-light': '#333333',  // For selected items, active tabs
        'vsc-text-primary': '#CCCCCC',
        'vsc-text-secondary': '#808080', // For comments, disabled text
        'vsc-accent-blue': '#007ACC', // For interactive elements, links
        'vsc-border-light': '#444444', // For subtle borders
        'vsc-selection-bg': '#264F78', // For selected text background
        // Add specific syntax highlighting colors
        'vsc-keyword': '#569CD6', // For 'def', 'import'
        'vsc-string': '#CE9178',  // For "hello world"
        'vsc-comment': '#6A9955',  // For comments
        
        // Light mode colors
        'vsc-light-bg-dark': '#FFFFFF',
        'vsc-light-bg-medium': '#F3F3F3', // For sidebars, status bars
        'vsc-light-bg-light': '#E8E8E8',  // For selected items, active tabs
        'vsc-light-text-primary': '#1E1E1E',
        'vsc-light-text-secondary': '#6C6C6C', // For comments, disabled text
        'vsc-light-accent-blue': '#0078D4', // For interactive elements, links
        'vsc-light-border': '#C8C8C8', // For subtle borders
        'vsc-light-selection-bg': '#ADD6FF', // For selected text background
        // Light mode syntax highlighting colors
        'vsc-light-keyword': '#0000FF', // For 'def', 'import'
        'vsc-light-string': '#A31515',  // For "hello world"
        'vsc-light-comment': '#008000',  // For comments
        
        // Keep some original colors for backward compatibility
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