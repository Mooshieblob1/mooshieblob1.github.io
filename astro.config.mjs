import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://mooshieblob.com',
  output: 'static',
  integrations: [
    vue(),
    tailwind(),
  ],
  vite: {
    ssr: {
      noExternal: ['motion'],
    },
  },
});
