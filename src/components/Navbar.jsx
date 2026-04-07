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

  return (
    <header
      className="app-header"
      onMouseLeave={() => setHoveredTo(null)}
    >
      <NavLink
        to="/"
        className={({ isActive }) =>
          showHomeActive(isActive, hoveredTo)
            ? 'app-brand app-brand--active'
            : 'app-brand'
        }
        end
        onMouseEnter={() => setHoveredTo('/')}
      >
        学习辅导平台
      </NavLink>
      <nav className="app-nav" aria-label="主导航">
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
    </header>
  )
}
