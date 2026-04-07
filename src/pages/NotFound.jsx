import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section>
      <h1>页面不存在</h1>
      <p>请检查地址，或返回首页。</p>
      <p>
        <Link to="/">回到首页</Link>
      </p>
    </section>
  )
}
