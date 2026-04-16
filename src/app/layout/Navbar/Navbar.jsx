import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  fetchServerSessionUser,
  signOutEverywhere,
  syncSupabaseSessionToServer,
} from '../../../modules/auth/api/loginApi.js'
import { getSupabase, isSupabaseConfigured } from '../../../shared/lib/supabaseClient.js'
import styles from './Navbar.module.css'

const links = [
  { to: '/', label: '首页' },
  { to: '/courses', label: '课程' },
  { to: '/plan', label: '学习计划' },
  { to: '/progress', label: '学习进度' },
  { to: '/qa', label: '提问' },
  { to: '/profile', label: '个人中心' },
]

function showHomeActive(isRouteActive, hoveredTo) {
  if (!isRouteActive) return false
  if (hoveredTo == null) return true
  return hoveredTo === '/'
}

export default function Navbar() {
  const [hoveredTo, setHoveredTo] = useState(null)
  const [query, setQuery] = useState('')
  const [authUser, setAuthUser] = useState(null)
  const [authBusy, setAuthBusy] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function refreshAuth() {
      let server = await fetchServerSessionUser()
      if (
        !server.ok &&
        server.code !== 'no_server_api' &&
        isSupabaseConfigured() &&
        getSupabase()
      ) {
        await syncSupabaseSessionToServer(getSupabase())
        server = await fetchServerSessionUser()
      }
      if (cancelled) return

      if (server.ok) {
        setAuthUser(server.user)
        return
      }

      if (isSupabaseConfigured() && getSupabase()) {
        const { data } = await getSupabase().auth.getUser()
        if (cancelled) return
        const u = data.user
        setAuthUser(u ? { id: u.id, email: u.email ?? undefined } : null)
        return
      }

      setAuthUser(null)
    }

    refreshAuth()

    const sb = getSupabase()
    if (!sb) {
      return () => {
        cancelled = true
      }
    }

    const { data: sub } = sb.auth.onAuthStateChange(() => {
      refreshAuth()
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    setAuthBusy(true)
    try {
      await signOutEverywhere()
      setAuthUser(null)
    } finally {
      setAuthBusy(false)
    }
  }

  return (
    <header className={styles.header} onMouseLeave={() => setHoveredTo(null)}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <NavLink
            to="/"
            className={styles.brand}
            end
            onMouseEnter={() => setHoveredTo('/')}
          >
            <span className={styles.brandLogo} aria-hidden="true" />
            <span className={styles.brandText}>
              <span className={styles.brandTitle}>学习辅导平台</span>
              <span className={styles.brandSubtitle}>University Study</span>
            </span>
          </NavLink>
        </div>

        <nav className={styles.center} aria-label="主导航">
          <div className={styles.nav}>
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  showHomeActive(isActive, hoveredTo)
                    ? `${styles.navLink} ${styles.navLinkActive}`
                    : styles.navLink
                }
                end={to === '/'}
                onMouseEnter={() => setHoveredTo(to)}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className={styles.right}>
          <div className={styles.searchRow}>
            <label className={styles.search} aria-label="搜索">
              <span className={styles.searchIcon} aria-hidden="true" />
              <input
                className={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索课程/问题"
              />
            </label>
          </div>

          <div className={styles.authRow}>
            <button className={styles.pill} type="button">
              English
            </button>
            {authUser ? (
              <>
                <span className={styles.userHint} title={authUser.email ?? authUser.id}>
                  {authUser.email ?? authUser.id}
                </span>
                <button
                  className={`${styles.btn} ${styles.btnGhost}`}
                  type="button"
                  onClick={handleLogout}
                  disabled={authBusy}
                >
                  {authBusy ? '退出中…' : '退出'}
                </button>
              </>
            ) : (
              <>
                <Link className={`${styles.btn} ${styles.btnGhost}`} to="/login">
                  登录
                </Link>
                <Link className={styles.btn} to="/register">
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

