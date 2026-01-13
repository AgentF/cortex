import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Import path node module

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Map the package name to the local source file
      '@cortex/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  // Security: Allow Vite to serve files from the packages directory (outside root)
  server: {
    fs: {
      allow: ['..'],
    },
  },
})