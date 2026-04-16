import { useEffect, useState } from 'react'
import {
  consumeRegisterFlash,
  drainRegisterFlashReplay,
} from '../../auth/lib/registerFlash.js'
import styles from './HomePage.module.css'
import HomeHero from '../ui/HomeHero/HomeHero.jsx'
import QuickActions from '../ui/QuickActions/QuickActions.jsx'
import StatsGrid from '../ui/StatsGrid/StatsGrid.jsx'
import MentorGrid from '../ui/MentorGrid/MentorGrid.jsx'
import CourseGrid from '../ui/CourseGrid/CourseGrid.jsx'
import HotQA from '../ui/HotQA/HotQA.jsx'

export default function HomePage() {
   const [registerBanner, setRegisterBanner] = useState(() => consumeRegisterFlash())

  useEffect(() => {
    if (!registerBanner) return undefined
    let innerId = null
    const outerId = requestAnimationFrame(() => {
      innerId = requestAnimationFrame(() => drainRegisterFlashReplay())
    })
    return () => {
      cancelAnimationFrame(outerId)
      if (innerId != null) cancelAnimationFrame(innerId)
    }
  }, [registerBanner])

  return (
    <>
      <HomeHero />
      {registerBanner ? (
        <div className={styles.flash}>
          <div className={styles.flashInner} role="status">
            <p className={styles.flashText}>
              {registerBanner.needsEmailConfirm
                ? '注册成功！若已开启邮箱验证，请前往邮箱点击链接完成验证。'
                : '注册成功！欢迎使用学习辅导平台。'}
            </p>
            <button
              type="button"
              className={styles.flashClose}
              aria-label="关闭提示"
              onClick={() => setRegisterBanner(null)}
            >
              关闭
            </button>
          </div>
        </div>
      ) : null}
      <div className={styles.page}>
        <QuickActions className={styles.section} />
        <StatsGrid className={styles.section} />
        <MentorGrid className={styles.section} />
        <CourseGrid className={styles.section} />
        <HotQA className={styles.section} />
      </div>
    </>
  )
}

