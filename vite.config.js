import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { authSessionApiPlugin } from './plugins/authSessionApi.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      authSessionApiPlugin({
        supabaseUrl: env.VITE_SUPABASE_URL,
        supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY,
      }),
    ],
  }
})
