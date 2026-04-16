import { createClient } from '@supabase/supabase-js'

const COOKIE_ACCESS = 'sb_app_access'
const COOKIE_REFRESH = 'sb_app_refresh'

function jwtMaxAgeSeconds(jwt) {
  try {
    const part = jwt.split('.')[1]
    if (!part) return 3600
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
    const json = JSON.parse(Buffer.from(b64 + pad, 'base64').toString('utf8'))
    if (json?.exp && typeof json.exp === 'number') {
      return Math.max(60, json.exp - Math.floor(Date.now() / 1000))
    }
  } catch {
    /* ignore */
  }
  return 3600
}

function parseCookies(cookieHeader) {
  const out = {}
  if (!cookieHeader || typeof cookieHeader !== 'string') return out
  for (const piece of cookieHeader.split(';')) {
    const idx = piece.indexOf('=')
    if (idx === -1) continue
    const name = piece.slice(0, idx).trim()
    const value = piece.slice(idx + 1).trim()
    try {
      out[name] = decodeURIComponent(value)
    } catch {
      out[name] = value
    }
  }
  return out
}

function buildClearCookie(name) {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
}

function buildCookie(name, value, maxAgeSec) {
  const safe = encodeURIComponent(value)
  return `${name}=${safe}; Path=/; Max-Age=${maxAgeSec}; HttpOnly; SameSite=Lax`
}

function readJsonBody(req, maxLen = 48_000) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > maxLen) {
        reject(new Error('body_too_large'))
      }
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(body))
}

/**
 * Dev / preview middleware: validates Supabase JWT, stores tokens in httpOnly cookies,
 * exposes /api/auth/me for server-side "is logged in" checks.
 */
export function authSessionApiPlugin({ supabaseUrl, supabaseAnonKey }) {
  return {
    name: 'auth-session-api',
    configureServer(server) {
      server.middlewares.use(createMiddleware({ supabaseUrl, supabaseAnonKey }))
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMiddleware({ supabaseUrl, supabaseAnonKey }))
    },
  }
}

function createMiddleware({ supabaseUrl, supabaseAnonKey }) {
  const supabase =
    supabaseUrl && supabaseAnonKey
      ? createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      : null

  return async (req, res, next) => {
    const rawUrl = req.url ?? ''
    const path = rawUrl.split('?')[0]

    if (!path.startsWith('/api/auth')) {
      next()
      return
    }

    try {
      if (path === '/api/auth/session' && req.method === 'POST') {
        if (!supabase) {
          sendJson(res, 503, { ok: false, code: 'not_configured', message: 'Supabase 未配置。' })
          return
        }
        const body = await readJsonBody(req)
        const access_token = body?.access_token
        const refresh_token = body?.refresh_token
        if (!access_token || typeof access_token !== 'string') {
          sendJson(res, 400, { ok: false, code: 'bad_request', message: '缺少 access_token。' })
          return
        }

        const { data, error } = await supabase.auth.getUser(access_token)
        if (error || !data?.user) {
          sendJson(res, 401, { ok: false, code: 'invalid_token', message: '令牌无效或已过期。' })
          return
        }

        const maxAge = jwtMaxAgeSeconds(access_token)
        const cookies = [buildCookie(COOKIE_ACCESS, access_token, maxAge)]
        if (refresh_token && typeof refresh_token === 'string') {
          cookies.push(buildCookie(COOKIE_REFRESH, refresh_token, 60 * 60 * 24 * 30))
        }
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Set-Cookie', cookies)
        res.end(
          JSON.stringify({
            ok: true,
            user: { id: data.user.id, email: data.user.email },
          }),
        )
        return
      }

      if (path === '/api/auth/me' && req.method === 'GET') {
        if (!supabase) {
          sendJson(res, 503, { ok: false, code: 'not_configured' })
          return
        }
        const cookies = parseCookies(req.headers.cookie)
        const access = cookies[COOKIE_ACCESS]
        if (!access) {
          sendJson(res, 401, { ok: false, code: 'unauthorized' })
          return
        }
        const { data, error } = await supabase.auth.getUser(access)
        if (error || !data?.user) {
          res.statusCode = 401
          res.setHeader('Set-Cookie', [buildClearCookie(COOKIE_ACCESS), buildClearCookie(COOKIE_REFRESH)])
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ ok: false, code: 'unauthorized' }))
          return
        }
        sendJson(res, 200, {
          ok: true,
          user: { id: data.user.id, email: data.user.email },
        })
        return
      }

      if (path === '/api/auth/logout' && req.method === 'POST') {
        res.statusCode = 204
        res.setHeader('Set-Cookie', [buildClearCookie(COOKIE_ACCESS), buildClearCookie(COOKIE_REFRESH)])
        res.end()
        return
      }

      sendJson(res, 404, { ok: false, code: 'not_found' })
    } catch (e) {
      if (e?.message === 'body_too_large') {
        sendJson(res, 413, { ok: false, code: 'payload_too_large' })
        return
      }
      sendJson(res, 500, { ok: false, code: 'server_error' })
    }
  }
}
