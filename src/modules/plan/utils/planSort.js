/**
 * 用于「最新写的在上」：有 createdAt 用时间；否则从 id（t_/r_ 时间戳）推断。
 * @param {{ id: string, createdAt?: string }} item
 */
export function writeTimeMs(item) {
  if (item.createdAt) {
    const t = new Date(item.createdAt).getTime()
    if (!Number.isNaN(t)) return t
  }
  const m = String(item.id).match(/^[tr]_(\d+)$/)
  if (m) return Number(m[1])
  return 0
}

/** 新写的在前（时间线、列表通用） */
export function compareNewestWriteFirst(a, b) {
  return writeTimeMs(b) - writeTimeMs(a)
}

/**
 * 时间线「单列」内卡片顺序：未完成在上，已完成沉底；同组内仍按创建时间新在上。
 * @param {{ done: boolean, item: { id: string, createdAt?: string } }} a
 * @param {{ done: boolean, item: { id: string, createdAt?: string } }} b
 */
export function compareDayTimelineStack(a, b) {
  const ad = a.done ? 1 : 0
  const bd = b.done ? 1 : 0
  if (ad !== bd) return ad - bd
  return compareNewestWriteFirst(a.item, b.item)
}
