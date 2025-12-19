
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // GitHub Pages 배포를 위한 상대 경로 설정
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 3000,
  },
});
