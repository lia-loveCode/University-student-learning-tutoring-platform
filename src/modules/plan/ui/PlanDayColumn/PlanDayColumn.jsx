import { getDayRewardBlocks } from '../../utils/planReward.js'
import { formatDateLongZh, weekdayZh } from '../../utils/planDates.js'
import styles from './PlanDayColumn.module.css'

export default function PlanDayColumn({
  day,
  checkedIn,
  hasScheduledTasks,
  allTasksComplete,
  onToggleCheckin,
  children,
}) {
  const blocks = getDayRewardBlocks({
    checkedIn,
    hasScheduledTasks,
    allTasksComplete,
  })

  return (
    <div className={styles.col} data-day={day}>
      <div className={styles.hd}>
        <div className={styles.hdTop}>
          <div>
            <time className={styles.date} dateTime={day}>
              {formatDateLongZh(day)}
            </time>
            <div className={styles.week}>{weekdayZh(day)}</div>
          </div>
          <button
            type="button"
            className={styles.checkin}
            data-done={checkedIn ? 'true' : 'false'}
            onClick={() => onToggleCheckin(day, !checkedIn)}
            aria-label="今日打卡：仅记录本列这一天的出勤，不会在其它日期列勾选完成，也不会替代各条日程的完成按钮"
          >
            {checkedIn ? '已打卡' : '今日打卡'}
          </button>
        </div>
        <div className={styles.rewardStack} role="status" aria-live="polite">
          {blocks.schedule.show ? (
            <div className={`${styles.reward} ${styles.rewardSchedule}`}>
              <span className={styles.rewardEmoji} aria-hidden="true">
                {blocks.schedule.emoji}
              </span>
              {blocks.schedule.text}
            </div>
          ) : null}
          {blocks.checkin.show ? (
            <div className={`${styles.reward} ${styles.rewardCheckin}`}>
              <span className={styles.rewardEmoji} aria-hidden="true">
                {blocks.checkin.emoji}
              </span>
              {blocks.checkin.text}
            </div>
          ) : null}
          {blocks.hint.show ? <div className={styles.rewardHint}>{blocks.hint.text}</div> : null}
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.rail} aria-hidden="true">
          <span className={styles.railLine} />
        </div>
        <div className={styles.stackWrap}>{children}</div>
      </div>
    </div>
  )
}
