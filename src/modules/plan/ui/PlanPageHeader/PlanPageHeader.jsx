import ProgressBar from '../../../../shared/ui/ProgressBar/ProgressBar.jsx'
import styles from './PlanPageHeader.module.css'

export default function PlanPageHeader({ title, subtitle, progressId, percent }) {
  return (
    <header className={styles.root}>
      <h1 className={styles.title} id={progressId}>
        {title}
      </h1>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      <ProgressBar percent={percent} id={progressId} />
    </header>
  )
}
