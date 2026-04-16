export const REGISTER_FLASH_KEY = 'reg_ok_flash'

/**
 * React 开发环境 StrictMode 会重复挂载，第二次 useState 初始化时 sessionStorage 可能已空。
 * 用内存暂存一次，保证横幅仍会出现；单挂载后再 drain，避免下次进首页误用旧数据。
 */
let strictModeReplay = null

/**
 * 读取并清除注册成功后的首页横幅数据（sessionStorage + 上述 replay）。
 * @returns {{ needsEmailConfirm: boolean } | null}
 */
export function consumeRegisterFlash() {
  if (strictModeReplay) {
    const x = strictModeReplay
    strictModeReplay = null
    return x
  }
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(REGISTER_FLASH_KEY)
    if (!raw) return null
    sessionStorage.removeItem(REGISTER_FLASH_KEY)
    const data = JSON.parse(raw)
    if (data?.v !== 1) return null
    const out = { needsEmailConfirm: Boolean(data.needsEmailConfirm) }
    strictModeReplay = out
    return out
  } catch {
    try {
      sessionStorage.removeItem(REGISTER_FLASH_KEY)
    } catch {
      /* ignore */
    }
    return null
  }
}

/** 在首页 layout 阶段调用：清掉仅单次挂载时残留的 replay。 */
export function drainRegisterFlashReplay() {
  strictModeReplay = null
}
