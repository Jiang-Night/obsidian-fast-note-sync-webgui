import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";


export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'terser', // 使用 Terser 压缩
    terserOptions: {
      compress: {
        drop_console: true,  // 去除 console.log
      },
    },
    chunkSizeWarningLimit: 1500, // 降低警告阈值到 1MB
    rollupOptions: {
      output: {
        // 代码分块策略
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 将 React 相关库打包到 react 块
            if (id.includes('react')) {
              return 'vendor-react';
            }
            // 将 Vditor 相关库打包到 editor 块
            if (id.includes('vditor')) {
              return 'vendor-editor';
            }
            // 将 Lucide 图标和 Motion 动画库打包在一起
            if (id.includes('lucide-react') || id.includes('motion')) {
              return 'vendor-ui';
            }
            // 其他第三方库
            return 'vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
