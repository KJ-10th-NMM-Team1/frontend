import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.VITE_API_BASE_URL || 'http://localhost:8787'

  return {
    plugins: [react(), tsconfigPaths()],
    server: {
      port: 5173,
      allowedHosts: ['app.dupilot.store'],
      open: true,
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 4173,
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    envPrefix: 'VITE_',
    build: {
      sourcemap: true,
    },
  }
})
