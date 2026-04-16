import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmail } from '../api/loginApi.js'
import styles from './RegisterPage.module.css'

function LoginErrorModal({ title, message, onClose }) {
  const titleId = useId()
  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className={styles.dialogTitle}>
          {title}
        </h2>
        <p className={styles.dialogBody}>{message}</p>
        <div className={styles.dialogActions}>
          <button type="button" className={styles.dialogBtn} onClick={onClose}>
            知道了
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [modal, setModal] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) {
      setModal({ title: '登录失败', message: '请填写邮箱地址。' })
      return
    }
    if (!password) {
      setModal({ title: '登录失败', message: '请填写密码。' })
      return
    }

    setSubmitting(true)
    try {
      const result = await signInWithEmail({
        email: email.trim(),
        password,
      })
      if (!result.ok) {
        setModal({ title: '登录失败', message: result.message })
        return
      }
      setPassword('')
      navigate('/', { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={styles.wrap}>
      <h1 className={styles.title}>登录</h1>
      <p className={styles.sub}>使用邮箱与密码登录；会话会同步到开发服务器的 Cookie 以便服务端校验。</p>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">
              邮箱
            </label>
            <input
              id="login-email"
              className={styles.input}
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-password">
              密码
            </label>
            <input
              id="login-password"
              className={styles.input}
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </div>

          <button
            type="submit"
            className={styles.submit}
            disabled={submitting}
          >
            {submitting ? '登录中…' : '登录'}
          </button>
        </form>

        <p className={styles.footer}>
          还没有账号？<Link to="/register">去注册</Link>
        </p>
      </div>

      {modal ? (
        <LoginErrorModal
          title={modal.title}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      ) : null}
    </section>
  )
}
