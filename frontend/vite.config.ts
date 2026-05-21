import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  server: {
    port: 5173,
    host: true, //host: '0.0.0.0',
    allowedHosts: ['d9911.zapto.org'],
    // allowedHosts: true,

    proxy: {
      '/api': {
        target: 'http://localhost:3001', // 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
})
