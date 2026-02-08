import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  
  define: {
    'process.env': JSON.stringify(process.env)
  },
  
  server: {
    port: 3000,
    middlewareMode: false,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
        rewrite: (path) => path
      },
      '/uploads': {
        target: apiUrl,
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
