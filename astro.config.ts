import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'never',
  server: {
    host: true,
    port: 4321,
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
    },
  },
});
