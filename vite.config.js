import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // No plugins needed for now
  plugins: [],
  // Configure development server
  server: {
    port: 3000, // You can change the port if needed
    open: true, // Automatically open the app in the browser on server start
  },
  // Configure build process
  build: {
    outDir: 'dist', // The directory where build files will be placed
    rollupOptions: {
      input: {
        main: './index.html' // Specify the entry point HTML file
      }
    }
  },
  // Set the base public path when serving or building
  base: '/',
}); 