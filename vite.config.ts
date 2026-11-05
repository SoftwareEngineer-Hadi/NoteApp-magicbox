import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function assertDevTarget(target: string) {
  let url: URL
  try {
    url = new URL(target)
  } catch {
    throw new Error('VITE_API_BASE_URL must be an absolute URL for the dev proxy')
  }
  const loopback =
    url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]'
  if (url.protocol === 'http:' && !loopback) {
    throw new Error('VITE_API_BASE_URL must use https except on loopback')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('VITE_API_BASE_URL must use http or https')
  }
  return url.origin
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_BASE_URL?.trim() ?? ''
  const proxyTarget = mode === 'development' ? assertDevTarget(target) : ''

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: proxyTarget
        ? {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
            },
          }
        : undefined,
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      include: ['src/**/*.{spec,test}.{ts,tsx}'],
      css: true,
      restoreMocks: true,
    },
  }
})
