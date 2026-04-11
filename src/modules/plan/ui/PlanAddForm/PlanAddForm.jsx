import { useState } from 'react'
import { addOnceTask, addRecurringTemplate } from '../../api/planApi.js'
import { PLAN_SLOT_OPTIONS } from '../../constants/planTags.js'
import PlanTagRadioGroup from '../PlanTagRadioGroup/PlanTagRadioGroup.jsx'
import styles from './PlanAddForm.module.css'

const ASSOCIATE_OPTIONS = [
  { value: 'none', label: '不关联' },
  { value: 'course', label: '站内课程' },
  { value: 'link', label: '链接' },
]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function PlanAddForm({ courses, onCreated, variant = 'page' }) {
  const [title, setTitle] = useState('')
  const [plannedDate, setPlannedDate] = useState(todayISO())
  const [due, setDue] = useState('')
  const [slot, setSlot] = useState('')
  const [associateMode, setAssociateMode] = useState('none')
  const [courseId, setCourseId] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [tag, setTag] = useState('复习')
  const [notes, setNotes] = useState('')
  const [longTask, setLongTask] = useState(false)
  const [recurringFrom, setRecurringFrom] = useState(todayISO())
  const [recurringTo, setRecurringTo] = useState(todayISO())
  const [busy, setBusy] = useState(false)

  function associationPayload() {
    if (associateMode === 'link') {
      return { courseId: null, linkUrl }
    }
    if (associateMode === 'course') {
      return { courseId: courseId || null, linkUrl: null }
    }
    return { courseId: null, linkUrl: null }
  }

  async function onSubmit(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || busy) return
    setBusy(true)
    try {
      const tags = [tag]
      const assoc = associationPayload()
      const created = longTask
        ? await addRecurringTemplate({
            title: trimmed,
            recurringFrom,
            recurringTo,
            slot,
            tags,
            notes,
            ...assoc,
          })
        : await addOnceTask({
            title: trimmed,
            plannedDate,
            due: due || null,
            slot,
            tags,
            notes,
            ...assoc,
          })
      setTitle('')
      setNotes('')
      setAssociateMode('none')
      setCourseId('')
      setLinkUrl('')
      await onCreated?.(created)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      className={`${styles.root} ${variant === 'modal' ? styles.rootModal : ''}`.trim()}
      onSubmit={onSubmit}
      aria-label="新建学习计划"
    >
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="plan-title">
            任务名称
          </label>
          <input
            id="plan-title"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：完成第三章习题"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="plan-date">
            计划做日期
          </label>
          <input
            id="plan-date"
            className={styles.input}
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
            disabled={longTask}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="plan-slot">
            时段（可选）
          </label>
          <select
            id="plan-slot"
            className={styles.input}
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
          >
            {PLAN_SLOT_OPTIONS.map((o) => (
              <option key={o.value || 'none'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className={`${styles.field} ${styles.fieldAssoc}`}>
          <div className={styles.assocHead}>
            <span className={styles.assocTitle} id="plan-assoc-lbl">
              关联内容
            </span>
            <span className={styles.assocSubtitle}>可选：绑定 App 内课程，或粘贴外部资料链接</span>
          </div>
          <div className={styles.assocCard} role="group" aria-labelledby="plan-assoc-lbl">
            <div className={styles.assocModes} role="radiogroup" aria-label="关联类型">
              {ASSOCIATE_OPTIONS.map((opt) => {
                const selected = associateMode === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={selected ? styles.assocModeOn : styles.assocMode}
                    onClick={() => setAssociateMode(opt.value)}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <div
              className={
                associateMode === 'none'
                  ? `${styles.assocBody} ${styles.assocBodyMuted}`
                  : styles.assocBody
              }
            >
              {associateMode === 'course' ? (
                <>
                  <label className={styles.assocFieldLabel} htmlFor="plan-course">
                    选择课程
                  </label>
                  <select
                    id="plan-course"
                    className={styles.assocSelect}
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    <option value="">请选择一门课程…</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
              {associateMode === 'link' ? (
                <>
                  <label className={styles.assocFieldLabel} htmlFor="plan-link">
                    链接地址
                  </label>
                  <input
                    id="plan-link"
                    className={styles.assocUrl}
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com/lesson 或 example.com"
                  />
                </>
              ) : null}
              {associateMode === 'none' ? (
                <p className={styles.assocEmpty}>当前任务不展示课程或外链入口</p>
              ) : null}
            </div>
          </div>
        </div>
        <div className={`${styles.field} ${styles.wide}`}>
          <span className={styles.label} id="plan-tag-lbl">
            标签配色（单选）
          </span>
          <PlanTagRadioGroup id="plan-tag-lbl" value={tag} onChange={setTag} />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="plan-due">
            截止日期（可选）
          </label>
          <input
            id="plan-due"
            className={styles.input}
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            disabled={longTask}
          />
        </div>
        <div className={styles.actions}>
          <button type="submit" className={styles.primary} disabled={busy}>
            {busy ? '添加中…' : '添加'}
          </button>
        </div>
        <div className={`${styles.field} ${styles.wide}`}>
          <label className={styles.label} htmlFor="plan-notes">
            备注（可选）
          </label>
          <textarea
            id="plan-notes"
            className={styles.textarea}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="补充说明，创建后可在列表中继续编辑"
          />
        </div>
      </div>

      <div className={styles.longRow}>
        <label className={styles.longCheck}>
          <input
            type="checkbox"
            checked={longTask}
            onChange={(e) => setLongTask(e.target.checked)}
          />
          长期任务：每天在时间线自动出现
        </label>
        {longTask ? (
          <div className={styles.longDates}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="plan-rfrom">
                从
              </label>
              <input
                id="plan-rfrom"
                className={styles.input}
                type="date"
                value={recurringFrom}
                onChange={(e) => setRecurringFrom(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="plan-rto">
                到
              </label>
              <input
                id="plan-rto"
                className={styles.input}
                type="date"
                value={recurringTo}
                onChange={(e) => setRecurringTo(e.target.value)}
              />
            </div>
          </div>
        ) : null}
        <p className={styles.longHint}>
          勾选后按「从 / 到」日期，每天在时间线生成同一条日程。
        </p>
      </div>
    </form>
  )
}
