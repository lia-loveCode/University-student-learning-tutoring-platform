import { mockRequest } from '../../../shared/api/request.js'
import { initialTasks } from '../model/planMock.js'

let tasks = [...initialTasks]

export function listTasks() {
  return mockRequest(() => tasks)
}

export function addTask({ title, due }) {
  return mockRequest(() => {
    const t = {
      id: `t_${Date.now()}`,
      title,
      due,
      done: false,
    }
    tasks = [t, ...tasks]
    return t
  })
}

export function toggleTaskDone(id) {
  return mockRequest(() => {
    tasks = tasks.map((t) =>
      t.id === id
        ? {
            ...t,
            done: !t.done,
            doneAt: !t.done ? new Date().toISOString().slice(0, 10) : undefined,
          }
        : t,
    )
    return tasks.find((t) => t.id === id) ?? null
  })
}

export function deleteTask(id) {
  return mockRequest(() => {
    const before = tasks.length
    tasks = tasks.filter((t) => t.id !== id)
    return { deleted: before !== tasks.length }
  })
}

