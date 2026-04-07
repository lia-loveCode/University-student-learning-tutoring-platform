import { Link } from 'react-router-dom'

const demoIds = ['1', '2', '3']

export default function Courses() {
  return (
    <section>
      <h1>课程列表</h1>
      <p>后续可接假数据与搜索；先占位动态路由入口。</p>
      <ul className="page-list">
        {demoIds.map((id) => (
          <li key={id}>
            <Link to={`/courses/${id}`}>课程详情 #{id}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
