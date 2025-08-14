import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  
  build: {
    outDir: '../dist',
    rollupOptions: {
      input: {
        // The path to your HTML file remains the same
        main: resolve(__dirname, 'src/index.html'),
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
      include: ['../tailwind.config.js'],
    }
  }
});
