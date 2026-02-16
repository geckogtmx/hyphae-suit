import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5175,
    host: '0.0.0.0'
  },
  plugins: [react(), tailwindcss()],
})
