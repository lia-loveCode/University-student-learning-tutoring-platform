import { useEffect, useState } from 'react'
import TagChip from '../../../../shared/ui/TagChip/TagChip.jsx'
import PlanAssociationPill from '../PlanAssociationPill/PlanAssociationPill.jsx'
import styles from './PlanOnceTaskCard.module.css'

function isTaskLate(task) {
  if (task.done || !task.due) return false
  return task.due < new Date().toISOString().slice(0, 10)
}

export default function PlanOnceTaskCard({
  task,
  courseLabel,
  highlightOpen,
  onToggleDone,
  onDelete,
  onSaveNotes,
}) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState(task.notes)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resync draft after reload
    setNotes(task.notes)
  }, [task.id, task.notes])

  useEffect(() => {
    if (highlightOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- open when focused from timeline
      setOpen(true)
    }
  }, [highlightOpen])

  async function onNotesBlur() {
    if (notes === task.notes) return
    await onSaveNotes(notes)
  }

  return (
    <article
      className={`${styles.card} ${task.done ? styles.done : ''}`}
      data-open={open ? 'true' : 'false'}
    >
      <div className={styles.hd}>
        <div className={styles.main}>
          <h2 className={styles.title}>{task.done ? '✅ ' : ''}{task.title}</h2>
          <div className={styles.meta}>
            <span className={styles.badgePlan}>计划做: {task.plannedDate}</span>
            {task.slot ? <span className={styles.badgeSlot}>{task.slot}</span> : null}
            {task.due ? (
              <span className={`${styles.due} ${isTaskLate(task) ? styles.late : ''}`}>
                截止: {task.due}
              </span>
            ) : (
              <span className={styles.due}>截止: 未设置</span>
            )}
            {task.done ? <span>完成: {task.doneAt ?? '—'}</span> : null}
          </div>
          <PlanAssociationPill
            courseId={task.courseId}
            linkUrl={task.linkUrl}
            courseLabel={courseLabel}
          />
          <div className={styles.tags}>
            {(task.tags || []).map((t) => (
              <TagChip key={t}>{t}</TagChip>
            ))}
          </div>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.btnGhost} onClick={() => onToggleDone(task.id)}>
            {task.done ? '取消完成' : '完成'}
          </button>
          <button type="button" className={styles.btnDanger} onClick={() => onDelete(task.id)}>
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
              <h3 className={styles.detailHd}>笔记 / 过程记录</h3>
              <textarea
                className={styles.notes}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={onNotesBlur}
                rows={5}
              />
            </div>
            <div>
              <h3 className={styles.detailHd}>子任务</h3>
              <ul className={styles.subs}>
                {(task.subtasks || []).map((s) => (
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
