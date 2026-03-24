import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nuditos.com.co',
  output: 'hybrid',
  adapter: netlify(),
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date('2025-03-23'),
    }),
  ],
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});
