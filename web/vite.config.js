import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // This is the fix: Force Vite to watch the Tailwind config file for changes.
    watch: {
      usePolling: true,
      include: ['../tailwind.config.js'],
    }
  }
});
