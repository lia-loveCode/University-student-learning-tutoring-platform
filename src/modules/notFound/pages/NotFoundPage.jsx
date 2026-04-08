import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section>
      <h1>页面不存在</h1>
      <p>请检查地址，或返回首页。</p>
      <p style={{ marginTop: 12 }}>
        <Link to="/">回到首页</Link>
      </p>
    </section>
  )
}

