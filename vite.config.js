import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/*', 'offline.html'],
      manifest: {
        name: 'Booknplay.lk',
        short_name: 'Booknplay',
        description: 'Find and book sports courts across Sri Lanka.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#FBFCF8',
        theme_color: '#C7F84B',
        prefer_related_applications: false,
        related_applications: [
          {
            platform: 'webapp',
            url: '/manifest.webmanifest',
          },
        ],
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      injectManifest: {
        // Shell assets only — do not add runtimeCaching for API/auth/payment hosts.
        // Skip large marketing images (>2 MiB) so they are never forced into the precache.
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}', 'icons/**/*.png'],
        globIgnores: [
          '**/midnight-multisport-arena*',
          '**/mobile-app-banner*',
          '**/sports-equipment*',
        ],
      },
      devOptions: { enabled: false },
    }),
  ],

  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
})
