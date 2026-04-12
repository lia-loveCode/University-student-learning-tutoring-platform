import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { getHomeBannerSlides } from '../../../modules/home/api/homeApi.js'
import styles from './BannerCarousel.module.css'

const FALLBACK_SLIDES = [
  {
    id: 'empty',
    kicker: '大学生学习辅导平台',
    title: '请在 Supabase 配置首页轮播',
    desc: '在 SQL Editor 执行 supabase/schema.sql（含 home_banner_slides），或于 Table Editor 添加幻灯片数据。',
    cta: { label: '去提问', to: '/qa' },
    secondaryCta: { label: '制定学习计划', to: '/plan' },
    image: null,
    tone: 'toneA',
  },
]

export default function BannerCarousel() {
  const [slides, setSlides] = useState(/** @type {typeof FALLBACK_SLIDES} */ ([]))
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    getHomeBannerSlides()
      .then((data) => {
        if (!alive) return
        setSlides(data.length ? data : FALLBACK_SLIDES)
      })
      .catch(() => {
        if (!alive) return
        setSlides(FALLBACK_SLIDES)
      })
      .finally(() => {
        if (alive) setReady(true)
      })
    return () => {
      alive = false
    }
  }, [])

  if (!ready) {
    return (
      <section className={styles.hero} aria-label="首页 Banner 轮播">
        <div className={`${styles.slide} ${styles.toneA} ${styles.loading}`}>
          <div className={styles.content}>
            <p className={styles.kicker}>加载中…</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.hero} aria-label="首页 Banner 轮播">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        loop={slides.length > 1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        className={styles.swiper}
      >
        {slides.map((s) => (
          <SwiperSlide key={s.id}>
            <div
              className={`${styles.slide} ${styles[s.tone] ?? styles.toneA} ${
                s.image ? styles.hasPhoto : ''
              }`}
              style={s.image ? { '--bg-url': `url(${s.image})` } : undefined}
            >
              <div className={styles.content}>
                <p className={styles.kicker}>{s.kicker}</p>
                <h1 className={styles.title}>{s.title}</h1>
                <p className={styles.desc}>{s.desc}</p>
                <div className={styles.actions}>
                  <Link className={styles.btn} to={s.cta.to}>
                    {s.cta.label}
                  </Link>
                  <Link className={`${styles.btn} ${styles.btnGhost}`} to={s.secondaryCta.to}>
                    {s.secondaryCta.label}
                  </Link>
                </div>
              </div>
              {!s.image ? (
                <div className={styles.art} aria-hidden="true">
                  <div className={styles.orb} />
                  <div className={styles.grid} />
                </div>
              ) : null}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
