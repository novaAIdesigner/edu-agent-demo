import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/edu-agent-demo/',
  root: '.',
  resolve: {
    conditions: ['browser'],
    alias: {
      // The SDK's browser build still references 'ws' via require() in websocketFactory.
      // In the browser, native WebSocket is used — shim 'ws' to an empty module.
      ws: path.resolve(__dirname, 'src/ws-shim.ts'),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: { main: 'index.html' },
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
  }
});
