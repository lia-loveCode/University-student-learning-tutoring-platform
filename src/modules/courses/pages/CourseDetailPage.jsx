import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCourseById } from '../api/coursesApi.js'

export default function CourseDetailPage() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)

  useEffect(() => {
    let alive = true
    getCourseById(id).then((data) => {
      if (alive) setCourse(data)
    })
    return () => {
      alive = false
    }
  }, [id])

  return (
    <section>
      <p style={{ margin: '0 0 16px' }}>
        <Link to="/courses">← 返回课程列表</Link>
      </p>
      <h1>课程详情</h1>
      {!course ? (
        <p>未找到课程或正在加载…</p>
      ) : (
        <>
          <p>
            当前课程：<strong>{course.title}</strong>
          </p>
          <p style={{ color: 'var(--color-text-dim)' }}>
            {course.category} · {course.level} · 上传：{course.author} · ★ {course.rating} ·
            学习 {course.learners}
          </p>
          <p style={{ marginTop: 12 }}>{course.summary}</p>
        </>
      )}
    </section>
  )
}

