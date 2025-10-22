import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    // 开发环境配置
    server: {
      port: 3000,
      open: true,
      host: true
    },
    // 生产环境配置
    base: isDev ? '/' : '/meigangdemo/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            element: ['element-plus'],
            echarts: ['echarts', 'vue-echarts']
          }
        }
      }
    }
  }
})
