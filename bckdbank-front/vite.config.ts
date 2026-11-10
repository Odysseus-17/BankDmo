import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react()],
    server: {
      // El navegador llama a /api y /finnhub en el mismo origen y Vite reenvía
      // la petición; así no hace falta configurar CORS en el backend.
      proxy: {
        '/api': env.VITE_BACKEND_URL || 'http://localhost:8081',
        '/finnhub': env.VITE_FINANCIAL_SERVICE_URL || 'http://localhost:3000',
      },
    },
  }
})
