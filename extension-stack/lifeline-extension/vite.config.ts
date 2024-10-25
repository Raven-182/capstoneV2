
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Where your static files like manifest.json, index.html live
  build: {
    outDir: 'dist', // Where the extension will be bundled
    rollupOptions: {
      input: {
        sidepanel: 'public/index.html', // Entry point for the side panel
      },
    },
  },
})
