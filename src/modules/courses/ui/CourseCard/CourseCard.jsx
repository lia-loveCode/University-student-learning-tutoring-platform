import { Link } from 'react-router-dom'
import styles from './CourseCard.module.css'

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} className={styles.card}>
      <div className={styles.body}>
        <div className={styles.title}>{course.title}</div>
        <div className={styles.meta}>
          <span>
            {course.category} · {course.level}
          </span>
          <span>★ {course.rating}</span>
          <span>学习 {course.learners}</span>
        </div>
      </div>
    </Link>
  )
}

