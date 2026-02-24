import pages from '@hono/vite-cloudflare-pages'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [pages()],
  build: {
    outDir: 'dist'
  }
})
