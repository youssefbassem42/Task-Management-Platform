import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('apexcharts') || id.includes('vue3-apexcharts')) {
            return 'charts'
          }

          if (
            id.includes('/vue/') ||
            id.includes('/pinia/') ||
            id.includes('/axios/') ||
            id.includes('/date-fns/')
          ) {
            return 'vendor'
          }
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
