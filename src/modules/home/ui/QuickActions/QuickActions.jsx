import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import base from '../Section/sectionBase.module.css'
import styles from './QuickActions.module.css'
import { getHomeQuickActions } from '../../api/homeApi.js'

export default function QuickActions({ className }) {
  const [actions, setActions] = useState([])

  useEffect(() => {
    let alive = true
    getHomeQuickActions()
      .then((data) => {
        if (alive) setActions(data)
      })
      .catch(() => {
        if (alive) setActions([])
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className={className} aria-label="核心功能快捷入口">
      <header className={base.sectionHeader}>
        <h2 className={base.sectionTitle}>核心功能</h2>
        <p className={base.sectionDesc}>从这里快速进入你最常用的模块。</p>
      </header>

      <div className={styles.grid}>
        {actions.map((a) => (
          <Link key={a.id} to={a.to} className={`${base.card} ${styles.card}`}>
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
      {actions.length === 0 ? (
        <p className={base.sectionDesc} style={{ marginTop: 8 }}>
          暂无快捷入口：请在 Supabase 执行 schema.sql 中的 home_quick_actions 段落，或在 Table Editor 添加数据。
        </p>
      ) : null}
    </section>
  )
}
