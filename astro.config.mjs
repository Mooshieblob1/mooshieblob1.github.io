import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import galleryApi from './scripts/dev-api.mjs';

export default defineConfig({
  site: 'https://mooshieblob.com',
  output: 'static',
  integrations: [
    vue(),
    tailwind(),
    galleryApi(),
  ],
  vite: {
    ssr: {
      noExternal: ['motion'],
    },
  },
});
