/**
 * @param {string} start YYYY-MM-DD
 * @param {string} end YYYY-MM-DD
 * @returns {string[]}
 */
export function enumerateDaysInclusive(start, end) {
  const out = []
  let cur = start
  while (cur <= end) {
    out.push(cur)
    const d = new Date(`${cur}T12:00:00`)
    d.setDate(d.getDate() + 1)
    cur = d.toISOString().slice(0, 10)
  }
  return out
}

/**
 * @param {{ plannedDate: string }[]} onceTasks
 * @param {{ recurringFrom: string, recurringTo: string }[]} recurring
 * @param {string} [anchorDay] optional extra day to always show (e.g. yesterday)
 */
export function collectTimelineDates(onceTasks, recurring, anchorDay = null) {
  const set = new Set()
  if (anchorDay) set.add(anchorDay)
  onceTasks.forEach((t) => set.add(t.plannedDate))
  recurring.forEach((r) => {
    enumerateDaysInclusive(r.recurringFrom, r.recurringTo).forEach((d) => set.add(d))
  })
  /* 日期列：最新（靠后）的日期排在左侧，先看到近期 */
  return Array.from(set).sort((a, b) => b.localeCompare(a))
}

export function weekdayZh(iso) {
  const w = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const dt = new Date(`${iso}T12:00:00`)
  return w[dt.getDay()]
}

export function formatDateLongZh(iso) {
  const [y, mo, d] = iso.split('-')
  return `${y} 年 ${Number(mo)} 月 ${Number(d)} 日`
}
