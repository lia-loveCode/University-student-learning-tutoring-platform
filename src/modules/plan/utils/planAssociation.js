/**
 * 提交前规范化链接（可省略协议）
 * @param {string} raw
 * @returns {string | null}
 */
export function sanitizeLinkUrl(raw) {
  const t = String(raw ?? '').trim()
  if (!t) return null
  if (/^https?:\/\//i.test(t)) return t
  if (/^\/\//.test(t)) return `https:${t}`
  if (/^[a-z0-9][\w.-]*\.[a-z]{2,}/i.test(t)) return `https://${t}`
  return t
}

/**
 * 时间线卡片副行：课程名 / 链接域名 / 未关联
 * @param {{ courseId?: string | null, linkUrl?: string | null }} task
 * @param {Map<string, { title: string }>} courseById
 */
export function associationSummaryForMeta(task, courseById) {
  const u = (task.linkUrl || '').trim()
  if (u) {
    try {
      const href = u.startsWith('http') ? u : `https://${u.replace(/^\/+/, '')}`
      const host = new URL(href).hostname
      return host ? `链接 · ${host}` : '链接'
    } catch {
      return '链接'
    }
  }
  if (task.courseId) return courseById.get(task.courseId)?.title ?? '课程'
  return '未关联'
}
