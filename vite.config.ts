import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/three') ||
            id.includes('node_modules/@react-three')
          ) {
            return 'three-vendor';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    open: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/security': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/privacy': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/consent': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
      '/rights': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
    },
  },
});
