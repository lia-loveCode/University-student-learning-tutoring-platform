import { Link } from 'react-router-dom'
import { sanitizeLinkUrl } from '../../utils/planAssociation.js'
import styles from './PlanAssociationPill.module.css'

function safeHref(raw) {
  const u = sanitizeLinkUrl(raw)
  if (!u) return null
  try {
    void new URL(u)
    return u
  } catch {
    return null
  }
}

function linkLabel(url) {
  const u = sanitizeLinkUrl(url)
  if (!u) return '链接'
  try {
    const parsed = new URL(u)
    return parsed.hostname || '链接'
  } catch {
    return u.length > 36 ? `${u.slice(0, 34)}…` : u
  }
}

/**
 * 展示任务关联：站内课程 / 外部链接 / 未关联
 */
export default function PlanAssociationPill({ courseId, linkUrl, courseLabel }) {
  const trimmed = String(linkUrl ?? '').trim()
  if (trimmed) {
    const href = safeHref(trimmed)
    return (
      <span className={styles.pillLink}>
        链接：
        {href ? (
          <a href={href} className={styles.extLink} target="_blank" rel="noopener noreferrer">
            {linkLabel(trimmed)}
          </a>
        ) : (
          <span className={styles.extFallback}>{trimmed}</span>
        )}
      </span>
    )
  }

  if (courseId) {
    return (
      <span className={styles.pill}>
        课程：
        <Link to={`/courses/${courseId}`} className={styles.innerLink}>
          {courseLabel || '课程'}
        </Link>
      </span>
    )
  }

  return <span className={styles.muted}>未关联</span>
}
