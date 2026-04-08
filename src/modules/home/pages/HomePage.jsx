import styles from './HomePage.module.css'
import HomeHero from '../ui/HomeHero/HomeHero.jsx'
import QuickActions from '../ui/QuickActions/QuickActions.jsx'
import StatsGrid from '../ui/StatsGrid/StatsGrid.jsx'
import MentorGrid from '../ui/MentorGrid/MentorGrid.jsx'
import CourseGrid from '../ui/CourseGrid/CourseGrid.jsx'
import HotQA from '../ui/HotQA/HotQA.jsx'

export default function HomePage() {
  return (
    <>
      <HomeHero />
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

