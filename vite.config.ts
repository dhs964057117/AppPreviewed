import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Add relative base for static hosting (like Cloudflare Pages)
  plugins: [react()],
})
