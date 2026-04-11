import SegmentedControl from '../../../../shared/ui/SegmentedControl/SegmentedControl.jsx'
import styles from './PlanViewToolbar.module.css'

const OPTIONS = [
  { value: 'timeline', label: '时间线' },
  { value: 'list', label: '列表' },
]

export default function PlanViewToolbar({ view, onViewChange, hint, onAdd }) {
  return (
    <div className={styles.root}>
      <div className={styles.mainRow}>
        <SegmentedControl value={view} onChange={onViewChange} options={OPTIONS} />
        {onAdd ? (
          <button type="button" className={styles.addBtn} onClick={onAdd}>
            添加
          </button>
        ) : null}
      </div>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </div>
  )
}
