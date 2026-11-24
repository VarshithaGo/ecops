import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Port can be overridden with VITE_PORT (run-local.sh picks a free one starting
// at 5173). strictPort:false lets Vite fall back to the next free port if the
// chosen one is taken — the Keycloak realm whitelists localhost:5173–5183, so
// login keeps working on any port in that range.
const port = Number(process.env.VITE_PORT) || 5173

// Where the dev server proxies /api to — the API gateway. Default matches
// run-local.sh, which runs the gateway on 8090.
const apiProxy = process.env.VITE_API_PROXY || 'http://localhost:8090'

export default defineConfig({
  plugins: [react()],
  server: {
    port,
    strictPort: false,
    proxy: {
      '/api': {
        target: apiProxy,
        changeOrigin: true,
      },
    },
  },
})
