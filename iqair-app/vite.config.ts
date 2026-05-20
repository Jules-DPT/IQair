import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/iqair-api': {
        target: 'https://api.airvisual.com/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/iqair-api/, ''),
        secure: true,
      }
    }
  }
})
