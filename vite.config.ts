import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'mylastbite',
        short_name: 'lastbite',
        // No start_url: per the web-app-manifest spec, when start_url is
        // absent the launch URL defaults to the page the app was installed
        // from. The owner installs from the secret /log/<slug> page so the
        // installed app opens ready to log; the secret can never go in this
        // public manifest, so this fallback is the only correct mechanism.
        start_url: undefined,
        display: 'standalone',
        theme_color: '#E5199A',
        background_color: '#E5199A',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname === '/api/meals',
            handler: 'NetworkFirst',
            options: { cacheName: 'meals-data' },
          },
        ],
      },
    }),
  ],
})
