import { Link } from 'react-router-dom'
import base from '../Section/sectionBase.module.css'
import styles from './QuickActions.module.css'

const actions = [
  { title: '找学长答疑', desc: '快速解决课程难点', to: '/qa', icon: '🎓' },
  { title: '课程资源', desc: '精选资料与学习路径', to: '/courses', icon: '📚' },
  { title: '学习计划', desc: '制定任务与进度跟踪', to: '/plan', icon: '🗓️' },
  { title: '提问社区', desc: '公开问答共同成长', to: '/qa', icon: '❓' },
]

export default function QuickActions({ className }) {
  return (
    <section className={className} aria-label="核心功能快捷入口">
      <header className={base.sectionHeader}>
        <h2 className={base.sectionTitle}>核心功能</h2>
        <p className={base.sectionDesc}>从这里快速进入你最常用的模块。</p>
      </header>

      <div className={styles.grid}>
        {actions.map((a) => (
          <Link key={a.title} to={a.to} className={`${base.card} ${styles.card}`}>
            <div className={styles.icon} aria-hidden="true">
              {a.icon}
            </div>
            <div>
              <div className={styles.title}>{a.title}</div>
              <div className={styles.desc}>{a.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

