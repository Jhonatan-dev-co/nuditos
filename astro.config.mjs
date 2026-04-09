import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://nuditos.com.co',
  output: 'hybrid',
  adapter: netlify(),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  integrations: [sitemap({
    changefreq: 'weekly',
    priority: 0.7,
    filter: (page) => !page.includes('/admin'),
  }), tailwind()],
  build: {
    inlineStylesheets: 'always',
  },
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});