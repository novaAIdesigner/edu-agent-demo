import { defineConfig } from 'vite';

export default defineConfig({
  base: '/edu-agent-demo/',
  root: '.',
  resolve: {
    conditions: ['browser'],
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: { main: 'index.html' },
      // Exclude Node.js-only ws module — SDK uses native WebSocket in browser
      external: ['ws'],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
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
    force: true,
    exclude: ['ws'],
  }
});
