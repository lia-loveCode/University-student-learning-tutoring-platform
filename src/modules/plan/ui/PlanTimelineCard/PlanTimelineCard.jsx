import TagChip from '../../../../shared/ui/TagChip/TagChip.jsx'
import styles from './PlanTimelineCard.module.css'

export default function PlanTimelineCard({
  variant,
  timelineTaskId,
  highlightFlash,
  title,
  slot,
  tags,
  associationSummary,
  due,
  done,
  onOpenInList,
  onToggleDone,
}) {
  const onceAttr = variant === 'once' ? timelineTaskId : undefined
  const recurringAttr = variant === 'recurring' ? timelineTaskId : undefined

  return (
    <div
      className={`${styles.root} ${variant === 'recurring' ? styles.daily : ''} ${
        done ? styles.done : ''
      } ${highlightFlash ? styles.highlightFlash : ''}`.trim()}
      data-once-task={onceAttr}
      data-recurring-task={recurringAttr}
      data-card-done={done ? 'true' : 'false'}
    >
      <button type="button" className={styles.main} onClick={onOpenInList}>
        {slot ? <div className={styles.slot}>{slot}</div> : null}
        <strong className={styles.title}>{title}</strong>
        <div className={styles.meta}>
          {variant === 'recurring' ? (
            <span className={styles.badgeDaily}>每日</span>
          ) : null}
          <span>{associationSummary}</span>
          {due ? <span> · 截止 {due}</span> : null}
        </div>
        <div className={styles.tags}>
          {(tags || []).map((t) => (
            <TagChip key={t}>{t}</TagChip>
          ))}
        </div>
      </button>
      <div className={styles.side}>
        <button
          type="button"
          className={`${styles.doneBtn} ${done ? styles.doneBtnActive : ''}`.trim()}
          onClick={(e) => {
            e.stopPropagation()
            onToggleDone?.()
          }}
        >
          {done ? '恢复' : '完成'}
        </button>
      </div>
    </div>
  )
}
