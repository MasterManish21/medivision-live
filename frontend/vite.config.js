import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/predict': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
      '/diseases': 'http://localhost:5000',
      '/chat': 'http://localhost:5000',
      '/symptom-check': 'http://localhost:5000',
    },
  },
})
