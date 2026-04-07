import { Link, useParams } from 'react-router-dom'

export default function CourseDetail() {
  const { id } = useParams()

  return (
    <section>
      <p className="page-back">
        <Link to="/courses">← 返回课程列表</Link>
      </p>
      <h1>课程详情</h1>
      <p>
        当前课程 ID：<code>{id}</code>
      </p>
      <p>此处后续展示章节、简介等。</p>
    </section>
  )
}
