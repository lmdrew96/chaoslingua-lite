import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel serves api/*.ts in production; `vite dev` doesn't, so this routes /api/auth
// to the same handler locally. Its Upstash env vars come from .env.local.
const apiInDev = (): Plugin => ({
  name: 'api-in-dev',
  configureServer(server) {
    Object.assign(process.env, loadEnv(server.config.mode, process.cwd(), 'UPSTASH_'))
    server.middlewares.use('/api/auth', async (req, res) => {
      try {
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const request = new Request(`http://localhost${req.originalUrl ?? '/api/auth'}`, {
          method: req.method,
          headers: req.headers as Record<string, string>,
          body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
        })
        const { default: handler } = await server.ssrLoadModule('/api/auth.ts')
        const response: Response = await handler.fetch(request)
        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))
        res.end(Buffer.from(await response.arrayBuffer()))
      } catch (err) {
        console.error('[api-in-dev] /api/auth failed', err)
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Local auth handler crashed — see the dev server log.' }))
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiInDev()],
})
