import styles from './ProgressBar.module.css'

/**
 * Thin horizontal progress (0–100).
 */
export default function ProgressBar({ percent, id }) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0))
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p)}
      aria-labelledby={id}
    >
      <i className={styles.fill} style={{ width: `${p}%` }} />
    </div>
  )
}
