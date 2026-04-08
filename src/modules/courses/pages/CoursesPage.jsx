import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCourses } from '../api/coursesApi.js'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    let alive = true
    listCourses().then((data) => {
      if (alive) setCourses(data)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section>
      <h1>课程列表</h1>
      <p>后续可接筛选与搜索；当前使用本地 Mock 数据。</p>
      <ul style={{ paddingLeft: 20 }}>
        {courses.map((c) => (
          <li key={c.id}>
            <Link to={`/courses/${c.id}`}>{c.title}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

