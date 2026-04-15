import { defineConfig } from 'vite';

export default defineConfig({
  base: '/edu-agent-demo/',
  root: '.',
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: { main: 'index.html' }
    }
  },
  server: {
    port: 3000,
    host: true,
    open: true,
    watch: {
      usePolling: true,
      interval: 300
    }
  },
  optimizeDeps: {
    force: true
  }
});
