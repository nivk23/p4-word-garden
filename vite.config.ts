import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separate content into its own chunk to reduce main bundle
          if (id.includes('/content/')) {
            return 'content'
          }
          // Separate recharts into its own chunk (only used on Insights page)
          if (id.includes('recharts')) {
            return 'recharts'
          }
          // Separate Firebase into vendor chunk
          if (id.includes('firebase')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
