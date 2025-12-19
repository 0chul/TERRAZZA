
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // 상대 경로를 사용하여 GitHub Pages의 하위 경로에서도 정적 자산이 올바르게 로드되도록 합니다.
  base: './',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});
