import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PWA assets (manifest + service workers) live in /public and are copied as-is.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
})
