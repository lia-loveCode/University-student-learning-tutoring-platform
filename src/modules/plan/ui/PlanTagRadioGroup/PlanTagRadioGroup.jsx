import TagChip from '../../../../shared/ui/TagChip/TagChip.jsx'
import { PLAN_TAG_OPTIONS } from '../../constants/planTags.js'
import styles from './PlanTagRadioGroup.module.css'

export default function PlanTagRadioGroup({ value, onChange, id }) {
  return (
    <div className={styles.root} role="radiogroup" aria-labelledby={id}>
      {PLAN_TAG_OPTIONS.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            className={styles.opt}
            aria-checked={selected}
            role="radio"
            onClick={() => onChange(opt.value)}
          >
            <TagChip>{opt.label}</TagChip>
          </button>
        )
      })}
    </div>
  )
}
