import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 800,
    commonjsOptions: {
      include: [/recharts/, /node_modules/],
    },
  },
  optimizeDeps: {
    include: ['recharts'],
  },
})