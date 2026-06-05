import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path'; // Node utility to resolve file system paths

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Allow external device access over local network IP (essential for testing on mobile!)
    proxy: {
      '/api': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        paymentTest: resolve(__dirname, 'payment-test.html'), // Instructs Vite to serve this file cleanly
      },
    },
  },
});
