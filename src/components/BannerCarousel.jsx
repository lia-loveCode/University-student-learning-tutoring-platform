import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import './BannerCarousel.css'

const slides = [
  {
    id: 'value',
    title: '学长 1v1 答疑 · 课程资源免费共享',
    desc: '把学习问题当场解决，把学习计划坚持下去。',
    cta: { label: '去提问', to: '/qa' },
    image: null,
    tone: 'tone-a',
  },
  {
    id: 'mentor',
    title: '热门答疑活动 · 学长招募中',
    desc: '加入答疑，沉淀你的学习方法，也帮助更多同学。',
    cta: { label: '查看个人中心', to: '/profile' },
    image: null,
    tone: 'tone-b',
  },
  {
    id: 'courses',
    title: '精品课程推荐 · 学习干货持续更新',
    desc: '从课程列表开始，建立你的学习路径。',
    cta: { label: '浏览课程', to: '/courses' },
    image: null,
    tone: 'tone-c',
  },
]

export default function BannerCarousel() {
  return (
    <section className="home-hero" aria-label="首页 Banner 轮播">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        loop
        navigation
        pagination={{ clickable: true }}
        // autoplay={{ delay: 3500, disableOnInteraction: false }}
        className="home-hero__swiper"
      >
        {slides.map((s) => (
          <SwiperSlide key={s.id}>
            <div
              className={`home-hero__slide ${s.tone} ${s.image ? 'has-photo' : ''}`}
              style={
                s.image
                  ? {
                      '--bg-url': `url(${s.image})`,
                    }
                  : undefined
              }
            >
              <div className="home-hero__content">
                <p className="home-hero__kicker">大学生学习辅导平台</p>
                <h1 className="home-hero__title">{s.title}</h1>
                <p className="home-hero__desc">{s.desc}</p>
                <div className="home-hero__actions">
                  <Link className="home-hero__btn" to={s.cta.to}>
                    {s.cta.label}
                  </Link>
                  <Link className="home-hero__btn home-hero__btn--ghost" to="/plan">
                    制定学习计划
                  </Link>
                </div>
              </div>
              {!s.image ? (
                <div className="home-hero__art" aria-hidden="true">
                  <div className="home-hero__orb" />
                  <div className="home-hero__grid" />
                </div>
              ) : null}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}

