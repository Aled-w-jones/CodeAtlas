// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://aled-w-jones.github.io',
  base: '/CodeAtlas',
  integrations: [
    svelte(), 
    tailwind({
      applyBaseStyles: false, // We're using our own global styles
    })
  ],
  output: 'static',
  build: {
    assets: 'assets'
  },
  vite: {
    build: {
      assetsInlineLimit: 0
    }
  }
});
