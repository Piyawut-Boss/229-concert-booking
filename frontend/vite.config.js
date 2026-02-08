import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ✅ สำคัญมาก สำหรับ nginx + Railway
  base: '/',

  // ✅ dev server เท่านั้น
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
