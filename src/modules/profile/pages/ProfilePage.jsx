import { useEffect, useState } from 'react'
import { getMyProfile, getMyProfileStats } from '../api/profileApi.js'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    let alive = true
    Promise.all([getMyProfile(), getMyProfileStats()]).then(([p, s]) => {
      if (!alive) return
      setProfile(p)
      setStats(s)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section>
      <h1>个人中心</h1>
      {!profile || !stats ? (
        <p className={styles.subtle}>正在加载…</p>
      ) : (
        <>
          <div className={styles.profileCard}>
            <div aria-hidden="true" className={styles.avatar} />
            <div className={styles.meta}>
              <div className={styles.name}>{profile.name}</div>
              <div className={styles.sub}>
                {profile.major} · {profile.grade}
              </div>
              <div className={styles.bio}>{profile.bio}</div>
            </div>
          </div>

          <div className={styles.statsGrid}>
            {[
              { label: '我的课程数', value: stats.myCourses },
              { label: '我的提问数', value: stats.myQuestions },
              { label: '我的回答数', value: stats.myAnswers },
              { label: '完成学习计划数', value: stats.completedPlans },
            ].map((s) => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statValue}>{s.value}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

