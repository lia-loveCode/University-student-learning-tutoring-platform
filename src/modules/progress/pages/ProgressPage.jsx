import { useEffect, useState } from 'react'
import { getProgressByCategory, getProgressSummary } from '../api/progressApi.js'
import styles from './ProgressPage.module.css'

export default function ProgressPage() {
  const [summary, setSummary] = useState(null)
  const [byCategory, setByCategory] = useState([])

  useEffect(() => {
    let alive = true
    Promise.all([getProgressSummary(), getProgressByCategory()]).then(([s, c]) => {
      if (!alive) return
      setSummary(s)
      setByCategory(c)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section>
      <h1>学习进度</h1>
      {!summary ? (
        <p className={styles.subtle}>正在加载…</p>
      ) : (
        <>
          <div className={styles.statsGrid}>
            {[
              { label: '本周专注时长', value: `${summary.weekFocusHours}h` },
              { label: '本周完成任务', value: `${summary.weekTasksDone}/${summary.weekTasksTotal}` },
              {
                label: '任务完成率',
                value: `${summary.weekTasksTotal ? Math.round((summary.weekTasksDone / summary.weekTasksTotal) * 100) : 0}%`,
              },
              { label: '连续学习天数', value: `${summary.streakDays} 天` },
            ].map((s) => (
              <div key={s.label} className={styles.card}>
                <div className={styles.label}>{s.label}</div>
                <div className={styles.value}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>按方向进度</h2>
            <div className={styles.list}>
              {byCategory.map((c) => (
                <div key={c.category} className={styles.card}>
                  <div className={styles.rowTop}>
                    <div className={styles.rowName}>{c.category}</div>
                    <div className={styles.rowPercent}>{c.percent}%</div>
                  </div>
                  <div className={styles.bar}>
                    <div className={styles.barFill} style={{ width: `${c.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

