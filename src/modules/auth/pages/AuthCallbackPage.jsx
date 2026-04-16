import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchServerSessionUser, syncSupabaseSessionToServer } from '../api/loginApi.js'
import { getSupabase, isSupabaseConfigured } from '../../../shared/lib/supabaseClient.js'
import styles from './AuthCallbackPage.module.css'

function detectInAppBrowser(uaRaw) {
  const ua = String(uaRaw || '').toLowerCase()
  // 常见内置浏览器：微信/QQ/QQ邮箱/支付宝/钉钉等
  if (ua.includes('micromessenger')) return { inApp: true, name: '微信' }
  if (ua.includes('qqmail')) return { inApp: true, name: 'QQ邮箱' }
  if (ua.includes('qq/') || ua.includes('mqqbrowser') || ua.includes('qqbrowser')) return { inApp: true, name: 'QQ' }
  if (ua.includes('alipayclient')) return { inApp: true, name: '支付宝' }
  if (ua.includes('dingtalk')) return { inApp: true, name: '钉钉' }
  return { inApp: false, name: null }
}

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('checking') // checking | ok | need_action
  const [detail, setDetail] = useState('')

  const env = useMemo(() => {
    if (typeof navigator === 'undefined') return { inApp: false, name: null, url: '' }
    const x = detectInAppBrowser(navigator.userAgent)
    return { ...x, url: typeof window !== 'undefined' ? window.location.href : '' }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function run() {
      const hash = typeof window !== 'undefined' ? window.location.hash : ''
      const qs = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
      const type = qs.get('type')
      if (type === 'recovery') {
        // 重置密码邮件：跳到专门页面处理 token & 设置新密码
        navigate(`/reset-password${window.location.search}${window.location.hash}`, { replace: true })
        return
      }

      // 先尝试把 supabase session 同步到本地 dev server（用于 Navbar 的 /api/auth/me）
      if (isSupabaseConfigured() && getSupabase()) {
        await syncSupabaseSessionToServer(getSupabase())
      }

      const server = await fetchServerSessionUser()
      if (cancelled) return

      if (server.ok) {
        setStatus('ok')
        setDetail('验证完成，正在跳转到登录页…')
        setTimeout(() => {
          if (!cancelled) navigate('/login', { replace: true })
        }, 800)
        return
      }

      // 内置浏览器：优先提示引导在系统浏览器打开，以免“登录被困在邮件 App 里”
      if (env.inApp) {
        setStatus('need_action')
        setDetail(`检测到你在${env.name}内置浏览器打开。建议在系统浏览器中打开此链接完成流程。`)
        return
      }

      // 普通浏览器但未识别到会话：给出兜底提示
      setStatus('need_action')
      setDetail('未检测到登录会话。你可以返回登录页使用邮箱密码登录，或重新打开最新的邮件链接。')
    }

    run()

    return () => {
      cancelled = true
    }
  }, [env.inApp, env.name, navigate])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(env.url)
      setDetail('链接已复制。请粘贴到系统浏览器地址栏打开。')
    } catch {
      setDetail('复制失败：请手动长按/选中下方链接复制，然后到系统浏览器打开。')
    }
  }

  return (
    <section className={styles.wrap}>
      <h1 className={styles.title}>正在完成验证…</h1>
      <p className={styles.sub}>
        这是邮件确认/重置密码的回调页。如果你是在邮件 App 内打开，可能会影响后续跳转体验。
      </p>

      <div className={styles.card}>
        <p className={styles.hint}>
          {status === 'checking' ? '处理中，请稍候…' : detail || '请按提示继续。'}
        </p>

        {status !== 'ok' ? (
          <>
            <div className={styles.actions}>
              <a className={styles.btn} href={env.url} target="_blank" rel="noreferrer">
                在浏览器中打开
              </a>
              <button className={`${styles.btn} ${styles.btnGhost}`} type="button" onClick={handleCopy}>
                复制链接
              </button>
              <Link className={`${styles.btn} ${styles.btnGhost}`} to="/login">
                返回登录
              </Link>
            </div>

            <div className={styles.urlBox} aria-label="当前链接">
              {env.url}
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}

