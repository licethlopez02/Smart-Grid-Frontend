import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Todo /api/* pasa por el API Gateway (8000); el navegador solo habla con :5173 (sin CORS).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 800,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})