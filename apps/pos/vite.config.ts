import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 5174,
      host: '0.0.0.0',
      // Note: COOP/COEP headers removed — those were needed for LibSQL WASM (SharedArrayBuffer/OPFS).
      // sql.js is a standard WASM module that works without cross-origin isolation.
    },
    plugins: [react()],
    assetsInclude: ['**/*.wasm'],
    define: {
      // 'process.env.API_KEY': REMOVED for security
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
