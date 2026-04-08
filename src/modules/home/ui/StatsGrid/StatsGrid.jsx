import { useEffect, useState } from 'react'
import base from '../Section/sectionBase.module.css'
import styles from './StatsGrid.module.css'
import { getHomeStats } from '../../api/homeApi.js'

function formatInt(n) {
  return new Intl.NumberFormat('zh-CN').format(n)
}

function formatTrend(rate) {
  const sign = rate >= 0 ? '+' : ''
  return `${sign}${(rate * 100).toFixed(1)}%`
}

export default function StatsGrid({ className }) {
  const [stats, setStats] = useState([])

  useEffect(() => {
    let alive = true
    getHomeStats().then((data) => {
      if (alive) setStats(data)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className={className} aria-label="平台数据看板">
      <header className={base.sectionHeader}>
        <h2 className={base.sectionTitle}>平台数据</h2>
        <p className={base.sectionDesc}>用数据感受平台的成长。</p>
      </header>

      <div className={styles.grid}>
        {stats.map((s) => (
          <div key={s.key} className={`${base.card} ${styles.card}`}>
            <div className={styles.top}>
              <div className={styles.label}>{s.label}</div>
              <div className={styles.trend}>{formatTrend(s.trend)}</div>
            </div>
            <div className={styles.value}>{formatInt(s.value)}</div>
            <div className={styles.miniChart} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

