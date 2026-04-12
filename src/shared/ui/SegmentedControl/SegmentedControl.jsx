import styles from './SegmentedControl.module.css'

/**
 * Two-or-more segment toggle (e.g. 时间线 / 列表).
 */
export default function SegmentedControl({
  value,
  onChange,
  options,
  ariaLabel = '视图切换',
}) {
  return (
    <div className={styles.root} role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const pressed = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            className={styles.btn}
            aria-pressed={pressed}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
