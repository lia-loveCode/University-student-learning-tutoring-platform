import styles from './SurfaceCard.module.css'

/**
 * Generic bordered surface (card shell) aligned with list pages like /courses.
 */
export default function SurfaceCard({ children, className = '', ...rest }) {
  return (
    <section className={`${styles.root} ${className}`.trim()} {...rest}>
      {children}
    </section>
  )
}
