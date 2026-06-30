import { useFeedStore } from '../store/feedStore'
import type { TagFacet } from '../lib/tags'
import styles from './TagFilter.module.css'

export default function TagFilter({ facets }: { facets: TagFacet[] }) {
  const selectedTags = useFeedStore((state) => state.selectedTags)
  const toggleTag = useFeedStore((state) => state.toggleTag)
  const clearTags = useFeedStore((state) => state.clearTags)

  if (facets.length === 0) return null

  return (
    <div className={styles.filter}>
      <div className={styles.head}>
        <span>Filter by tag</span>
        {selectedTags.length > 0 && (
          <button type="button" className={styles.clear} onClick={() => clearTags()}>
            Clear ✕
          </button>
        )}
      </div>
      <div className={styles.chips}>
        {facets.map((facet) => (
          <button
            key={facet.tag}
            type="button"
            className={selectedTags.includes(facet.tag) ? styles.chipActive : styles.chip}
            onClick={() => toggleTag(facet.tag)}
          >
            {facet.label} {facet.count}
          </button>
        ))}
      </div>
    </div>
  )
}
