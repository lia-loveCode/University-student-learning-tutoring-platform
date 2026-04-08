import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import base from '../Section/sectionBase.module.css'
import styles from './MentorGrid.module.css'
import { getHomeMentors } from '../../api/homeApi.js'

export default function MentorGrid({ className }) {
  const [mentors, setMentors] = useState([])

  useEffect(() => {
    let alive = true
    getHomeMentors().then((data) => {
      if (alive) setMentors(data)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className={className} aria-label="热门学长推荐">
      <header className={base.sectionHeader}>
        <h2 className={base.sectionTitle}>热门学长推荐</h2>
        <p className={base.sectionDesc}>选对人，学习效率翻倍。</p>
      </header>

      <div className={styles.grid}>
        {mentors.map((m) => (
          <article key={m.id} className={`${base.card} ${styles.card}`}>
            <div className={styles.avatar} aria-hidden="true" />
            <div className={styles.meta}>
              <div className={styles.nameRow}>
                <div className={styles.name}>{m.name}</div>
                <div className={styles.rating}>★ {m.rating}</div>
              </div>
              <div className={styles.sub}>{m.major} · 答疑 {m.sessions} 次</div>
              <div className={styles.tags}>
                {m.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                  </span>
                ))}
              </div>
              <div className={styles.actions}>
                <Link to="/qa" className={base.btn}>
                  去咨询
                </Link>
                <Link to="/profile" className={base.btnGhost}>
                  查看主页
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

