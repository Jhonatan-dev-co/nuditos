import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://nuditos.com.co',
  output: 'hybrid',
  adapter: cloudflare(),
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
  integrations: [sitemap({
    changefreq: 'weekly',
    priority: 0.7,
    filter: (page) =>
      !page.includes('/admin') &&
      !page.includes('/checkout') &&
      !page.includes('/gracias') &&
      !page.includes('/test-video'),
    serialize(item) {
      if (item.url === 'https://nuditos.com.co/') {
        item.priority = 1.0;
        item.changefreq = 'daily';
      } else if (item.url.includes('/catalogo')) {
        item.priority = 0.9;
        item.changefreq = 'daily';
      } else if (item.url.includes('/blog')) {
        item.priority = 0.7;
      } else {
        item.priority = 0.5;
      }
      return item;
    },
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