import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// PWA assets (manifest + service workers) live in /public and are copied as-is.
// On GitHub Pages the app is served from /luxe-app/, so production uses that base.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/luxe-app/' : '/',
  plugins: [react()],
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
}))
