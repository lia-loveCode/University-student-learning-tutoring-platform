import { useEffect, useRef, useState } from 'react'
import {
  isRecurringDayDone,
  setCheckin,
  toggleOnceTaskDone,
  toggleRecurringDayDone,
} from '../../api/planApi.js'
import PlanDayColumn from '../PlanDayColumn/PlanDayColumn.jsx'
import PlanTimelineCard from '../PlanTimelineCard/PlanTimelineCard.jsx'
import { associationSummaryForMeta } from '../../utils/planAssociation.js'
import { compareDayTimelineStack, compareNewestWriteFirst } from '../../utils/planSort.js'
import styles from './PlanTimeline.module.css'

/**
 * @typedef {{ token: number, date: string, onceTaskId?: string, recurringTemplateId?: string }} PlanTimelineFocusRequest
 */

export default function PlanTimeline({
  days,
  onceTasks,
  recurringTemplates,
  checkins,
  recurringDayDone,
  courseById,
  reload,
  onOpenTaskInList,
  focusRequest = null,
  onFocusConsumed,
}) {
  const scrollRef = useRef(null)
  const courseMap = courseById
  /** @type {[{ kind: 'once' | 'recurring', id: string, day: string }] | null} */
  const [pulseTarget, setPulseTarget] = useState(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e) => {
      const { scrollWidth, clientWidth } = el
      if (scrollWidth <= clientWidth) return
      if (e.shiftKey) return
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      el.scrollLeft += e.deltaY
      e.preventDefault()
    }

    let dragging = false
    let startX = 0
    let startScroll = 0

    const onPointerDown = (e) => {
      if (e.button !== 0) return
      if (e.target.closest('button, a, input, textarea, select, [role="radio"]')) return
      dragging = true
      startX = e.clientX
      startScroll = el.scrollLeft
      el.classList.add(styles.isDragging)
    }

    const onPointerMove = (e) => {
      if (!dragging) return
      el.scrollLeft = startScroll - (e.clientX - startX)
    }

    const onPointerUp = () => {
      dragging = false
      el.classList.remove(styles.isDragging)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('mousedown', onPointerDown)
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup', onPointerUp)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('mouseup', onPointerUp)
    }
  }, [days])

  useEffect(() => {
    if (!focusRequest) return undefined

    let pulseClear
    const run = () => {
      const wrap = scrollRef.current
      if (!wrap) {
        onFocusConsumed?.()
        return
      }
      const { date, onceTaskId, recurringTemplateId } = focusRequest
      const col = wrap.querySelector(`[data-day="${date}"]`)
      if (!col) {
        onFocusConsumed?.()
        return
      }

      let target = null
      if (onceTaskId) {
        target = col.querySelector(`[data-once-task="${onceTaskId}"]`)
        if (target) {
          setPulseTarget({ kind: 'once', id: onceTaskId, day: date })
        }
      } else if (recurringTemplateId) {
        target = col.querySelector(`[data-recurring-task="${recurringTemplateId}"]`)
        if (target) {
          setPulseTarget({ kind: 'recurring', id: recurringTemplateId, day: date })
        }
      }

      const scrollEl = target ?? col
      scrollEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })

      const settleMs = target ? 1400 : 400
      pulseClear = window.setTimeout(() => {
        setPulseTarget(null)
        onFocusConsumed?.()
      }, settleMs)
    }

    const t = window.setTimeout(run, 80)
    return () => {
      window.clearTimeout(t)
      if (pulseClear) window.clearTimeout(pulseClear)
      setPulseTarget(null)
    }
  }, [focusRequest, onFocusConsumed])

  async function onToggleCheckin(day, value) {
    await setCheckin(day, value)
    await reload()
  }

  async function onToggleOnce(id) {
    await toggleOnceTaskDone(id)
    await reload()
  }

  async function onToggleRecurringDay(templateId, date) {
    await toggleRecurringDayDone(templateId, date)
    await reload()
  }

  return (
    <div className={styles.outer}>
      <div className={styles.wrap} ref={scrollRef}>
        <div className={styles.track}>
          {days.map((day) => {
            const dayOnes = onceTasks
              .filter((t) => t.plannedDate === day)
              .slice()
              .sort(compareNewestWriteFirst)
            const checkedIn = !!checkins[day]
            const dailies = recurringTemplates
              .filter((r) => day >= r.recurringFrom && day <= r.recurringTo)
              .slice()
              .sort(compareNewestWriteFirst)

            const merged = [
              ...dailies.map((r) => ({
                kind: 'recurring',
                item: r,
                done: isRecurringDayDone(r.id, day, recurringDayDone),
              })),
              ...dayOnes.map((t) => ({
                kind: 'once',
                item: t,
                done: !!t.done,
              })),
            ].sort(compareDayTimelineStack)

            const hasScheduledTasks = dayOnes.length > 0 || dailies.length > 0
            const onceAllDone = dayOnes.length === 0 || dayOnes.every((t) => t.done)
            const recurringAllDone =
              dailies.length === 0 ||
              dailies.every((r) => isRecurringDayDone(r.id, day, recurringDayDone))
            const allTasksComplete = hasScheduledTasks && onceAllDone && recurringAllDone

            const cells = merged.map((entry) => {
              if (entry.kind === 'recurring') {
                const r = entry.item
                const done = isRecurringDayDone(r.id, day, recurringDayDone)
                return (
                  <PlanTimelineCard
                    key={`${r.id}-${day}`}
                    variant="recurring"
                    timelineTaskId={r.id}
                    highlightFlash={
                      pulseTarget?.kind === 'recurring' &&
                      pulseTarget.id === r.id &&
                      pulseTarget.day === day
                    }
                    title={r.title}
                    slot={r.slot}
                    tags={r.tags}
                    associationSummary={associationSummaryForMeta(r, courseMap)}
                    due={null}
                    done={done}
                    onOpenInList={() => onOpenTaskInList({ kind: 'recurring', id: r.id })}
                    onToggleDone={() => onToggleRecurringDay(r.id, day)}
                  />
                )
              }
              const t = entry.item
              return (
                <PlanTimelineCard
                  key={t.id}
                  variant="once"
                  timelineTaskId={t.id}
                  highlightFlash={
                    pulseTarget?.kind === 'once' &&
                    pulseTarget.id === t.id &&
                    pulseTarget.day === day
                  }
                  title={t.title}
                  slot={t.slot}
                  tags={t.tags}
                  associationSummary={associationSummaryForMeta(t, courseMap)}
                  due={t.due}
                  done={t.done}
                  onOpenInList={() => onOpenTaskInList({ kind: 'once', id: t.id })}
                  onToggleDone={() => onToggleOnce(t.id)}
                />
              )
            })

            return (
              <PlanDayColumn
                key={day}
                day={day}
                checkedIn={checkedIn}
                hasScheduledTasks={hasScheduledTasks}
                allTasksComplete={allTasksComplete}
                onToggleCheckin={onToggleCheckin}
              >
                {cells.length === 0 ? (
                  <div className={styles.empty}>
                    本日暂无安排
                    <span className={styles.emptySub}>可添加任务或设置长期日程</span>
                  </div>
                ) : (
                  cells
                )}
              </PlanDayColumn>
            )
          })}
        </div>
      </div>
      <p className={styles.scrollHint}>
        在下方区域左右滑动、按住空白处拖拽，或使用触控板横滑 / 滚轮（纵向滚动会带动横向浏览）查看更多日期。
      </p>
    </div>
  )
}
