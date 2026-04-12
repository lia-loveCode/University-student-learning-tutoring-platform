import { useState } from 'react'
import styles from './FilterControls.module.css'

function normalizeStr(v) {
  return String(v ?? '')
}

function isActiveFilter(value) {
  return normalizeStr(value).trim() !== ''
}

function toChipLabel(def, value) {
  const str = normalizeStr(value).trim()
  if (!str) return ''
  return `${def.label}：${str}`
}

function PillsGroup({ label, value, options, onChange }) {
  return (
    <div className={styles.group} aria-label={`${label} 筛选`}>
      <div className={styles.groupLabel}>{label}</div>
      <div className={styles.pills}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={styles.pill}
            data-active={normalizeStr(value) === normalizeStr(opt.value) ? 'true' : 'false'}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Global, reusable filter controls.
 *
 * - variant="inline": always show pills groups below the search row (best when results are few)
 * - variant="panel": show a toggle; expand pushes content (no overlay), so it won't cover list items
 */
export default function FilterControls({
  title,
  hint,
  keyword,
  onKeywordChange,
  keywordPlaceholder = '搜索…',
  filters,
  filterDefs,
  onFilterChange,
  onReset,
  resultCount,
  variant = 'panel',
  defaultPanelOpen = false,
}) {
  const [open, setOpen] = useState(defaultPanelOpen)

  const activeDefs = filterDefs.filter((d) => isActiveFilter(filters?.[d.key]))

  return (
    <section className={styles.shell} aria-label={title ?? '搜索与筛选'}>
      {(title || hint) && (
        <header className={styles.header}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {hint && <p className={styles.hint}>{hint}</p>}
        </header>
      )}

      <div className={styles.row}>
        <div className={styles.searchWrap}>
          <input
            className={styles.input}
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder={keywordPlaceholder}
            aria-label="搜索关键词"
          />
          {keyword?.trim() ? (
            <button
              type="button"
              className={styles.clear}
              onClick={() => onKeywordChange('')}
              aria-label="清空搜索"
              title="清空"
            >
              ×
            </button>
          ) : null}
        </div>

        {variant === 'panel' ? (
          <button
            type="button"
            className={styles.btn}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open ? 'true' : 'false'}
          >
            {open ? '收起筛选' : '展开筛选'}
          </button>
        ) : (
          <span className={styles.inlineBadge}>结果少 → 内联筛选</span>
        )}

        <button type="button" className={styles.btnGhost} onClick={onReset}>
          重置
        </button>
      </div>

      <div className={styles.meta}>
        <span>
          共 <strong>{resultCount ?? 0}</strong> 门课程
        </span>
        {variant === 'panel' && activeDefs.length ? (
          <div className={styles.chips} aria-label="已选条件">
            {activeDefs.map((d) => (
              <button
                key={d.key}
                type="button"
                className={styles.chip}
                onClick={() => onFilterChange(d.key, '')}
                title="移除条件"
              >
                {toChipLabel(d, filters?.[d.key])} <span className={styles.x}>×</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {variant === 'inline' ? (
        <div className={styles.inlineArea} aria-label="内联筛选区">
          {filterDefs.map((d) => (
            <PillsGroup
              key={d.key}
              label={d.label}
              value={filters?.[d.key] ?? ''}
              options={d.options}
              onChange={(v) => onFilterChange(d.key, v)}
            />
          ))}
        </div>
      ) : open ? (
        <div className={styles.panelArea} aria-label="筛选面板（推开内容）">
          {filterDefs.map((d) => (
            <PillsGroup
              key={d.key}
              label={d.label}
              value={filters?.[d.key] ?? ''}
              options={d.options}
              onChange={(v) => onFilterChange(d.key, v)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}

