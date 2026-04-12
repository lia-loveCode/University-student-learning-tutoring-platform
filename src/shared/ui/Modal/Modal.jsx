import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.css'

/**
 * 全屏蒙层 + 居中面板。蒙层使用 backdrop-filter 模糊背后内容。
 * 通过 Portal 挂到 document.body，避免被父级 overflow 裁剪。
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  /** 无 title 时用 aria-label */
  ariaLabel,
}) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <header className={styles.head}>
            {title ? (
              <h2 className={styles.title} id={titleId}>
                {title}
              </h2>
            ) : (
              <span className={styles.titlePlaceholder} />
            )}
            <button type="button" className={styles.close} onClick={onClose} aria-label="关闭">
              ×
            </button>
          </header>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
