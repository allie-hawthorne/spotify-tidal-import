import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  build: {
    outDir: mode === 'production' ? 'spotifree' : 'dist',
  },
  plugins: [react(), tailwindcss()],
}))
