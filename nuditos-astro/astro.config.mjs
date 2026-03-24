import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://nuditos.com.co',
  output: 'hybrid',
  adapter: netlify(),
  vite: {
    css: {
      devSourcemap: true,
    },
  },
});