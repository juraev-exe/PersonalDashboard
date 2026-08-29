import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/pwa/*.png'],
      manifest: {
        name: 'LifeOS — Personal Dashboard',
        short_name: 'LifeOS',
        description: 'Personal productivity dashboard for tasks, habits, prayers, projects, and analytics.',
        start_url: '/',
        display: 'standalone',
        background_color: '#020206',
        theme_color: '#020206',
        icons: [
          { src: '/icons/pwa/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/pwa/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        globIgnores: ['**/images/icons/**'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /\/images\/icons\/.*\.png$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-mock-icons',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      'lucide-react': fileURLToPath(new URL('./src/components/icons/packIcons.tsx', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/notion': {
        target: 'https://api.notion.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notion/, ''),
      },
    },
  },
});
