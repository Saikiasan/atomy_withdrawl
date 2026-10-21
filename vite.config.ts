import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.webp', 'apple-touch-icon.webp', 'pwa-192x192.webp', 'pwa-512x512.webp'],
        manifest: {
          id: '/',
          name: 'Atomy Withdrawal Form Assistant',
          short_name: 'AtomyForm',
          description: 'AI-assisted Atomy Membership Withdrawal Form generator and email drafter',
          theme_color: '#0284c7',
          background_color: '#f8fafc',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.webp',
              sizes: '192x192',
              type: 'image/webp',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.webp',
              sizes: '512x512',
              type: 'image/webp',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.webp',
              sizes: '512x512',
              type: 'image/webp',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,pdf}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
