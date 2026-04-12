import { useEffect, useState } from 'react'
import TagChip from '../../../../shared/ui/TagChip/TagChip.jsx'
import PlanAssociationPill from '../PlanAssociationPill/PlanAssociationPill.jsx'
import styles from './PlanRecurringTaskCard.module.css'

export default function PlanRecurringTaskCard({
  template,
  courseLabel,
  highlightOpen,
  onDelete,
  onSaveNotes,
}) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(template.notes)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resync draft after reload
    setNotes(template.notes)
  }, [template.id, template.notes])

  useEffect(() => {
    if (highlightOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- open when focused from timeline
      setOpen(true)
    }
  }, [highlightOpen])

  async function onNotesBlur() {
    if (notes === template.notes) return
    await onSaveNotes(notes)
  }

  return (
    <article className={styles.card} data-open={open ? 'true' : 'false'}>
      <div className={styles.hd}>
        <div className={styles.main}>
          <h2 className={styles.title}>{template.title}</h2>
          <div className={styles.meta}>
            <span className={styles.badgeDaily}>每日重复</span>
            <span className={styles.badgeRange}>
              {template.recurringFrom} ～ {template.recurringTo}
            </span>
            {template.slot ? <span className={styles.badgeSlot}>{template.slot}</span> : null}
          </div>
          <PlanAssociationPill
            courseId={template.courseId}
            linkUrl={template.linkUrl}
            courseLabel={courseLabel}
          />
          <div className={styles.tags}>
            {(template.tags || []).map((t) => (
              <TagChip key={t}>{t}</TagChip>
            ))}
          </div>
          <p className={styles.hint}>完成状态请在时间线按「日」勾选；此处为模板与记录。</p>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.btnDanger} onClick={() => onDelete(template.id)}>
            删除
          </button>
        </div>
        <div className={styles.expandCol}>
          <button
            type="button"
            className={styles.expandBtn}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            详细记录 <span className={styles.chev} aria-hidden="true">▾</span>
          </button>
        </div>
      </div>
      {open ? (
        <div className={styles.detail}>
          <div className={styles.detailGrid}>
            <div>
              <h3 className={styles.detailHd}>笔记 / 说明</h3>
              <textarea
                className={styles.notes}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={onNotesBlur}
                rows={5}
              />
            </div>
            <div>
              <h3 className={styles.detailHd}>子任务（每日相同）</h3>
              <ul className={styles.subs}>
                {(template.subtasks || []).map((s) => (
                  <li key={s.id}>
                    <input type="checkbox" checked={s.done} readOnly tabIndex={-1} />
                    <span>{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}
