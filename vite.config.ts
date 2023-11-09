import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  assetsInclude: ['./src/files/**'],
  css: {
    preprocessorOptions: {}
  }
})
