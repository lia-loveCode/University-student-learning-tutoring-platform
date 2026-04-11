/**
 * 奖励 / 提示拆成两块，避免「今日打卡」与「日程完成」在心理上被混成一件事：
 * - 打卡：只写 checkins[当日]，不影响 recurringDayDone、不影响其它日期列。
 * - 日程奖励：仅当「本列」全部单次 + 本日各条每日任务都点过完成。
 *
 * @param {{
 *   checkedIn: boolean,
 *   hasScheduledTasks: boolean,
 *   allTasksComplete: boolean,
 * }} p
 * @returns {{
 *   schedule: { show: boolean, emoji: string, text: string },
 *   checkin: { show: boolean, emoji: string, text: string },
 *   hint: { show: boolean, text: string },
 * }}
 */
export function getDayRewardBlocks({ checkedIn, hasScheduledTasks, allTasksComplete }) {
  const scheduleShow = hasScheduledTasks && allTasksComplete

  const checkinText = hasScheduledTasks
    ? '今日打卡已记录：仅标记本日这一列的出勤，不会在其它日期列代为勾选「完成」，也不会替代你在本列对每条日程（含每日任务）的「完成」。'
    : '今日打卡已记录（本列当前无日程时，仅为本日出勤记录）。'

  const hintShow = hasScheduledTasks && !allTasksComplete && !checkedIn

  return {
    schedule: {
      show: scheduleShow,
      emoji: '🌟',
      text: '本日时间轴上的日程已全部完成 · +1 学习点 · 小奖励「专注糖」',
    },
    checkin: {
      show: checkedIn,
      emoji: '📝',
      text: checkinText,
    },
    hint: {
      show: hintShow,
      text: '请在本列逐个点「完成」：连续/每日任务在每一天各自结算；全部完成后解锁上方日程奖励。',
    },
  }
}
