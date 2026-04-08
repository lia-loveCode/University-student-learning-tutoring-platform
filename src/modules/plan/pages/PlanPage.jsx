import { useEffect, useMemo, useState } from 'react'
import { addTask, deleteTask, listTasks, toggleTaskDone } from '../api/planApi.js'
import styles from './PlanPage.module.css'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function PlanPage() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [due, setDue] = useState(todayISO())

  useEffect(() => {
    let alive = true
    listTasks().then((data) => {
      if (alive) setTasks(data)
    })
    return () => {
      alive = false
    }
  }, [])

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.done).length
    const percent = total === 0 ? 0 : Math.round((done / total) * 100)
    return { total, done, percent }
  }, [tasks])

  async function onAdd(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    const created = await addTask({ title: trimmed, due })
    setTasks((prev) => [created, ...prev])
    setTitle('')
  }

  async function onToggle(id) {
    const updated = await toggleTaskDone(id)
    if (!updated) return
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }

  async function onDelete(id) {
    const res = await deleteTask(id)
    if (!res.deleted) return
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <section>
      <h1>学习计划</h1>
      <p className={styles.subtle}>
        已完成 {stats.done}/{stats.total}（{stats.percent}%）
      </p>

      <form onSubmit={onAdd} className={styles.form}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入任务名称"
          className={styles.titleInput}
        />
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className={styles.dateInput}
        />
        <button
          type="submit"
          className={styles.primaryBtn}
        >
          添加
        </button>
      </form>

      <div className={styles.list}>
        {tasks.map((t) => (
          <div
            key={t.id}
            className={styles.task}
          >
            <div className={styles.taskMain}>
              <div className={styles.taskTitle}>
                {t.done ? '✅ ' : ''}{t.title}
              </div>
              <div className={styles.taskMeta}>
                截止：{t.due}{t.doneAt ? ` · 完成：${t.doneAt}` : ''}
              </div>
            </div>
            <div className={styles.taskActions}>
              <button
                type="button"
                onClick={() => onToggle(t.id)}
                className={styles.ghostBtn}
              >
                {t.done ? '取消完成' : '完成'}
              </button>
              <button
                type="button"
                onClick={() => onDelete(t.id)}
                className={styles.dangerBtn}
              >
                删除
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 ? (
          <div className={styles.subtle}>暂无任务，先添加一个吧。</div>
        ) : null}
      </div>
    </section>
  )
}

