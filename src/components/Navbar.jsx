import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: '首页' },
  { to: '/courses', label: '课程' },
  { to: '/plan', label: '学习计划' },
  { to: '/progress', label: '学习进度' },
  { to: '/qa', label: '提问' },
  { to: '/profile', label: '个人中心' },
]

/** 当前路由是首页时，若鼠标正悬在「非首页」链接上，则暂时不显示首页的选中态 */
function showHomeActive(isRouteActive, hoveredTo) {
  if (!isRouteActive) return false
  if (hoveredTo == null) return true
  return hoveredTo === '/'
}

export default function Navbar() {
  const [hoveredTo, setHoveredTo] = useState(null)
  const [query, setQuery] = useState('')

  return (
    <header
      className="app-header"
      onMouseLeave={() => setHoveredTo(null)}
    >
      <div className="app-header__inner">
        <div className="app-header__left">
          <NavLink
            to="/"
            className="app-brand"
            end
            onMouseEnter={() => setHoveredTo('/')}
          >
            <span className="app-brand__logo" aria-hidden="true" />
            <span className="app-brand__text">
              <span className="app-brand__title">学习辅导平台</span>
              <span className="app-brand__subtitle">University Study</span>
            </span>
          </NavLink>
        </div>

        <nav className="app-header__center app-nav" aria-label="主导航">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                showHomeActive(isActive, hoveredTo)
                  ? 'app-nav-link app-nav-link--active'
                  : 'app-nav-link'
              }
              end={to === '/'}
              onMouseEnter={() => setHoveredTo(to)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="app-header__right">
          <div className="app-header__searchRow">
            <label className="app-search" aria-label="搜索">
              <span className="app-search__icon" aria-hidden="true" />
              <input
                className="app-search__input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索课程/问题"
              />
            </label>
          </div>

          <div className="app-header__authRow">
            <button className="app-pill" type="button">
              English
            </button>
            <button className="app-btn app-btn--ghost" type="button">
              登录
            </button>
            <button className="app-btn" type="button">
              注册
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
