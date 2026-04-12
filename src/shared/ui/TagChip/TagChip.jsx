import styles from './TagChip.module.css'

/** @typedef {'作业' | '考试' | '复习' | '编程' | '项目' | '习惯' | string} PlanTagLabel */

const VARIANT_BY_LABEL = {
  作业: 'hw',
  考试: 'exam',
  复习: 'rev',
  编程: 'code',
  项目: 'proj',
  习惯: 'habit',
}

/**
 * Small colored label for categories (学习计划、筛选结果等可复用).
 */
export default function TagChip({ children, variant: variantProp }) {
  const label = typeof children === 'string' ? children : ''
  const variant = variantProp ?? VARIANT_BY_LABEL[label] ?? 'rev'
  return <span className={`${styles.chip} ${styles[`v_${variant}`]}`}>{children}</span>
}

export { VARIANT_BY_LABEL }
