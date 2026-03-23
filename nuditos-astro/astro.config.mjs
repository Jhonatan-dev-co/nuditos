import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nuditos.com.co',
  output: 'hybrid',          // Mayoría estático + SSR donde se necesite
  adapter: netlify(),
  integrations: [
    sitemap({
      // El sitemap incluye todas las páginas generadas automáticamente
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
  vite: {
    // Permite importar CSS desde src/styles/
    css: {
      devSourcemap: true,
    },
  },
});
