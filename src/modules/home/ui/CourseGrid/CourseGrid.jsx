import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import base from '../Section/sectionBase.module.css'
import styles from './CourseGrid.module.css'
import { getHomeCourses } from '../../api/homeApi.js'

export default function CourseGrid({ className }) {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    let alive = true
    getHomeCourses().then((data) => {
      if (alive) setCourses(data)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section className={className} aria-label="精品课程资源">
      <header className={base.sectionHeader}>
        <h2 className={base.sectionTitle}>精品课程资源</h2>
        <p className={base.sectionDesc}>精选课程与资料，直接开学。</p>
      </header>

      <div className={styles.grid}>
        {courses.map((c) => (
          <Link key={c.id} to={`/courses/${c.id}`} className={`${base.card} ${styles.card}`}>
            <div className={styles.cover} aria-hidden="true" />
            <div className={styles.body}>
              <div className={styles.title}>{c.title}</div>
              <div className={styles.sub}>
                {c.category} · 上传：{c.author}
              </div>
              <div className={styles.metrics}>
                <span>学习 {c.learners}</span>
                <span>★ {c.rating}</span>
              </div>
              <div className={styles.ctaRow}>
                <span className={styles.cta}>开始学习</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

