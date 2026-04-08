import { useState } from 'react'
import { NavLink } from 'react-router-dom'
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
            <button className={`${styles.btn} ${styles.btnGhost}`} type="button">
              登录
            </button>
            <button className={styles.btn} type="button">
              注册
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

