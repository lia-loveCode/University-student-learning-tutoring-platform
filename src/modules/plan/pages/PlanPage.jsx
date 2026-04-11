import { useCallback, useEffect, useMemo, useState } from 'react'
import { listCourses } from '../../courses/api/coursesApi.js'
import SurfaceCard from '../../../shared/ui/SurfaceCard/SurfaceCard.jsx'
import {
  deleteOnceTask,
  deleteRecurringTemplate,
  fetchPlanDashboard,
  toggleOnceTaskDone,
  updateOnceTaskNotes,
  updateRecurringNotes,
} from '../api/planApi.js'
import { collectTimelineDates } from '../utils/planDates.js'
import { compareNewestWriteFirst } from '../utils/planSort.js'
import PlanAddModal from '../ui/PlanAddModal/PlanAddModal.jsx'
import PlanOnceTaskCard from '../ui/PlanOnceTaskCard/PlanOnceTaskCard.jsx'
import PlanPageHeader from '../ui/PlanPageHeader/PlanPageHeader.jsx'
import PlanRecurringTaskCard from '../ui/PlanRecurringTaskCard/PlanRecurringTaskCard.jsx'
import PlanTimeline from '../ui/PlanTimeline/PlanTimeline.jsx'
import PlanViewToolbar from '../ui/PlanViewToolbar/PlanViewToolbar.jsx'
import styles from './PlanPage.module.css'

/** 时间线左侧留白列（与静态原型一致，可删） */
const TIMELINE_ANCHOR_DAY = '2026-04-09'

export default function PlanPage() {
  const [dash, setDash] = useState(null)
  const [courses, setCourses] = useState([])
  const [view, setView] = useState('timeline')
  const [listFocus, setListFocus] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addFormKey, setAddFormKey] = useState(0)
  /** 新建任务后滚动时间线并高亮：{ token, date, onceTaskId? | recurringTemplateId? } */
  const [timelineFocus, setTimelineFocus] = useState(null)

  const reload = useCallback(async () => {
    const next = await fetchPlanDashboard()
    setDash(next)
  }, [])

  useEffect(() => {
    let alive = true
    Promise.all([fetchPlanDashboard(), listCourses()]).then(([d, c]) => {
      if (!alive) return
      setDash(d)
      setCourses(c)
    })
    return () => {
      alive = false
    }
  }, [])

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])

  const timelineDays = useMemo(() => {
    if (!dash) return []
    return collectTimelineDates(
      dash.onceTasks,
      dash.recurringTemplates,
      TIMELINE_ANCHOR_DAY,
    )
  }, [dash])

  const stats = useMemo(() => {
    if (!dash) return { done: 0, total: 0, percent: 0, recurring: 0 }
    const total = dash.onceTasks.length
    const done = dash.onceTasks.filter((t) => t.done).length
    const percent = total === 0 ? 0 : Math.round((done / total) * 100)
    return {
      done,
      total,
      percent,
      recurring: dash.recurringTemplates.length,
    }
  }, [dash])

  const sortedOnce = useMemo(() => {
    if (!dash) return []
    return [...dash.onceTasks].sort(compareNewestWriteFirst)
  }, [dash])

  const sortedRecurring = useMemo(() => {
    if (!dash) return []
    return [...dash.recurringTemplates].sort(compareNewestWriteFirst)
  }, [dash])

  function courseTitle(id) {
    if (!id) return ''
    return courseById.get(id)?.title ?? ''
  }

  function onOpenTaskInList(focus) {
    setView('list')
    setListFocus(focus)
  }

  function openAddModal() {
    setAddFormKey((k) => k + 1)
    setAddOpen(true)
  }

  const clearTimelineFocus = useCallback(() => {
    setTimelineFocus(null)
  }, [])

  async function onAddCreated(created) {
    await reload()
    setAddOpen(false)
    setView('timeline')
    if (created?.plannedDate) {
      setTimelineFocus({
        token: Date.now(),
        date: created.plannedDate,
        onceTaskId: created.id,
      })
    } else if (created?.recurringFrom) {
      setTimelineFocus({
        token: Date.now(),
        date: created.recurringFrom,
        recurringTemplateId: created.id,
      })
    }
  }

  if (!dash) {
    return (
      <section className={styles.page}>
        <p className={styles.loading}>加载学习计划…</p>
      </section>
    )
  }

  const toolbarHint =
    '配色标签用于区分任务类型；不设搜索与筛选。长期任务在「从 / 到」日期内每天都会出现在时间线中。'

  return (
    <section className={styles.page}>
      <PlanAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        courses={courses}
        onCreated={onAddCreated}
        formKey={addFormKey}
      />
      <SurfaceCard>
        <PlanPageHeader
          title="学习计划"
          subtitle={`已完成 ${stats.done} / ${stats.total}（${stats.percent}%）· 单次计划 · 长期模板 ${stats.recurring} 条`}
          progressId="plan-progress-label"
          percent={stats.percent}
        />
        <PlanViewToolbar
          view={view}
          onViewChange={(next) => {
            setView(next)
            if (next !== 'timeline') setTimelineFocus(null)
          }}
          hint={toolbarHint}
          onAdd={openAddModal}
        />

        {view === 'timeline' ? (
          <div className={styles.panel}>
            <PlanTimeline
              days={timelineDays}
              onceTasks={dash.onceTasks}
              recurringTemplates={dash.recurringTemplates}
              checkins={dash.checkins}
              recurringDayDone={dash.recurringDayDone}
              courseById={courseById}
              reload={reload}
              onOpenTaskInList={onOpenTaskInList}
              focusRequest={timelineFocus}
              onFocusConsumed={clearTimelineFocus}
            />
          </div>
        ) : (
          <div className={styles.panel}>
            {sortedRecurring.length > 0 ? (
              <>
                <p className={styles.listSectionHd}>长期 · 每日自动出现</p>
                <div className={styles.listStack}>
                  {sortedRecurring.map((r) => (
                    <PlanRecurringTaskCard
                      key={r.id}
                      template={r}
                      courseLabel={courseTitle(r.courseId)}
                      highlightOpen={listFocus?.kind === 'recurring' && listFocus.id === r.id}
                      onDelete={async (id) => {
                        await deleteRecurringTemplate(id)
                        await reload()
                      }}
                      onSaveNotes={async (notes) => {
                        await updateRecurringNotes(r.id, notes)
                        await reload()
                      }}
                    />
                  ))}
                </div>
              </>
            ) : null}

            <p className={styles.listSectionHd}>单次计划</p>
            <div className={styles.listStack}>
              {sortedOnce.length === 0 ? (
                <div className={styles.empty} role="status">
                  暂无单次任务。点击工具栏「添加」创建，或添加长期日程。
                </div>
              ) : (
                sortedOnce.map((t) => (
                  <PlanOnceTaskCard
                    key={t.id}
                    task={t}
                    courseLabel={courseTitle(t.courseId)}
                    highlightOpen={listFocus?.kind === 'once' && listFocus.id === t.id}
                    onToggleDone={async (id) => {
                      await toggleOnceTaskDone(id)
                      await reload()
                    }}
                    onDelete={async (id) => {
                      await deleteOnceTask(id)
                      await reload()
                    }}
                    onSaveNotes={async (notes) => {
                      await updateOnceTaskNotes(t.id, notes)
                      await reload()
                    }}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </SurfaceCard>
    </section>
  )
}
