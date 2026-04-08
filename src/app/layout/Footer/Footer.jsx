import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="底部信息栏">
      <div className={styles.inner}>
        <nav className={styles.links} aria-label="底部链接">
          <a className={styles.link} href="#" onClick={(e) => e.preventDefault()}>
            关于我们
          </a>
          <a className={styles.link} href="#" onClick={(e) => e.preventDefault()}>
            帮助中心
          </a>
          <a className={styles.link} href="#" onClick={(e) => e.preventDefault()}>
            隐私政策
          </a>
          <a className={styles.link} href="#" onClick={(e) => e.preventDefault()}>
            联系我们
          </a>
        </nav>
        <div className={styles.copy}>© 2026 大学生学习辅导平台</div>
      </div>
    </footer>
  )
}

