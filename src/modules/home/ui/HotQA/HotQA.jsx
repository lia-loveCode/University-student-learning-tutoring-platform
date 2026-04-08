import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import base from '../Section/sectionBase.module.css'
import styles from './HotQA.module.css'
import { getHomeHotQuestions } from '../../api/homeApi.js'

export default function HotQA({ className }) {
  const [questions, setQuestions] = useState([])

  useEffect(() => {
    let alive = true
    getHomeHotQuestions().then((data) => {
      if (alive) setQuestions(data)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className={className} aria-label="热门问答专区">
      <header className={base.sectionHeader}>
        <h2 className={base.sectionTitle}>热门问答</h2>
        <p className={base.sectionDesc}>大家都在问的题，往往最关键。</p>
      </header>

      <div className={styles.list}>
        {questions.map((q) => (
          <Link key={q.id} to="/qa" className={`${base.card} ${styles.item}`}>
            <div className={styles.itemMain}>
              <div className={styles.itemTitle}>{q.title}</div>
              <div className={styles.itemMeta}>
                <span className={base.pill}>{q.tag}</span>
                <span>回答 {q.answers}</span>
                <span>浏览 {q.views}</span>
              </div>
            </div>
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

