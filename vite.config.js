import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Set the project root to your 'src' directory
  root: 'src',
  build: {
    // Output the final build to the root 'dist' folder
    outDir: '../dist',
    // Clean the 'dist' folder before each build
    emptyOutDir: true,
  },
});