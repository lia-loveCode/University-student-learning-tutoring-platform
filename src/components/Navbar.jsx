import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: '首页' },
  { to: '/courses', label: '课程' },
  { to: '/plan', label: '学习计划' },
  { to: '/progress', label: '学习进度' },
  { to: '/qa', label: '提问' },
  { to: '/profile', label: '个人中心' },
]

export default function Navbar() {
  return (
    <header className="app-header">
      <NavLink to="/" className="app-brand" end>
        学习辅导平台
      </NavLink>
      <nav className="app-nav" aria-label="主导航">
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? 'app-nav-link app-nav-link--active' : 'app-nav-link'
            }
            end={to === '/'}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
