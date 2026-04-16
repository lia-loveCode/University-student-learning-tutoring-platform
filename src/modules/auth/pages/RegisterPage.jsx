import { useId, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUpWithEmail } from '../api/registerApi.js'
import { REGISTER_FLASH_KEY } from '../lib/registerFlash.js'
import {
  isPasswordStrongEnough,
  passwordStrengthHint,
} from '../lib/passwordRules.js'
import styles from './RegisterPage.module.css'

function RegisterErrorModal({ title, message, onClose }) {
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

export default function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [modal, setModal] = useState(null)

  const strong = isPasswordStrongEnough(password)
  const hint = passwordStrengthHint(password)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) {
      setModal({ title: '注册失败', message: '请填写邮箱地址。' })
      return
    }
    if (!strong) {
      setModal({
        title: '注册失败',
        message: '密码不符合要求：至少 8 位，且需同时包含英文字母与数字。',
      })
      return
    }

    setSubmitting(true)
    try {
      const result = await signUpWithEmail({
        email: email.trim(),
        password,
      })
      if (!result.ok) {
        setModal({ title: '注册失败', message: result.message })
        return
      }
      try {
        sessionStorage.setItem(
          REGISTER_FLASH_KEY,
          JSON.stringify({
            v: 1,
            needsEmailConfirm: result.needsEmailConfirm,
          }),
        )
      } catch {
        /* ignore quota / private mode */
      }
      setPassword('')
      navigate('/', { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={styles.wrap}>
      <h1 className={styles.title}>注册</h1>
      <p className={styles.sub}>使用邮箱与密码创建账号。</p>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-email">
              邮箱
            </label>
            <input
              id="reg-email"
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
            <label className={styles.label} htmlFor="reg-password">
              密码
            </label>
            <input
              id="reg-password"
              className={styles.input}
              type="password"
              name="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 8 位，含字母与数字"
            />
            <p
              className={`${styles.hint} ${strong ? styles.hintOk : password ? styles.hintBad : ''}`}
            >
              {hint}
            </p>
          </div>

          <button
            type="submit"
            className={styles.submit}
            disabled={submitting}
          >
            {submitting ? '提交中…' : '注册'}
          </button>
        </form>

        <p className={styles.footer}>
          已有账号？<Link to="/login">去登录</Link>
        </p>
      </div>

      {modal ? (
        <RegisterErrorModal
          title={modal.title}
          message={modal.message}
          onClose={() => setModal(null)}
        />
      ) : null}
    </section>
  )
}
