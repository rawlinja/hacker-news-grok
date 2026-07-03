import { useEffect, useState } from 'react'
import { useFeedStore } from '../store/feedStore'
import type { TagFacet } from '../lib/tags'
import styles from './TagFilter.module.css'

export default function TagFilter({ facets }: { facets: TagFacet[] }) {
  const selectedTags = useFeedStore((state) => state.selectedTags)
  const toggleTag = useFeedStore((state) => state.toggleTag)
  const clearTags = useFeedStore((state) => state.clearTags)

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (facets.length === 0) return null

  return (
    <div className={styles.filter}>
      <div className={styles.head}>
        <button
          type="button"
          className={styles.trigger}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          Filter{selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}
        </button>
        {selectedTags.length > 0 && (
          <button type="button" className={styles.clear} onClick={() => clearTags()}>
            Clear ✕
          </button>
        )}
      </div>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="Filter by tag"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.sheetHead}>
              <span>Filter by tag</span>
              <button
                type="button"
                className={styles.close}
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <ul className={styles.list}>
              {facets.map((facet) => (
                <li key={facet.tag}>
                  <label className={styles.row}>
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(facet.tag)}
                      onChange={() => toggleTag(facet.tag)}
                    />
                    <span className={styles.rowLabel}>{facet.label}</span>
                    <span className={styles.rowCount}>{facet.count}</span>
                  </label>
                </li>
              ))}
            </ul>

            <div className={styles.sheetFoot}>
              <button type="button" className={styles.clearAll} onClick={() => clearTags()}>
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
