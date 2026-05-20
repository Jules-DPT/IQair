import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {
    proxy: {
      '/iqair-api': {
        target: 'https://website-api.airvisual.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/iqair-api/, ''),
      },
    }
  }
})