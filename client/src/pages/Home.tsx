import { useEffect } from 'react'
import StoryCard from '../components/StoryCard'
import StatusMessage from '../components/StatusMessage'
import TagFilter from '../components/TagFilter'
import { useFeedStore } from '../store/feedStore'
import { deriveTagFacets, filterByTags } from '../lib/tags'
import type { Feed } from '../types'
import styles from './Home.module.css'

const TABS: { key: Feed; label: string }[] = [
  { key: 'top', label: 'Top' },
  { key: 'new', label: 'New' },
  { key: 'best', label: 'Best' },
]

export default function Home() {
  const feed = useFeedStore((state) => state.feed)
  const loadedStories = useFeedStore((state) => state.loadedStories)
  const loading = useFeedStore((state) => state.loading)
  const error = useFeedStore((state) => state.error)
  const selectedTags = useFeedStore((state) => state.selectedTags)
  const ensureLoaded = useFeedStore((state) => state.ensureLoaded)
  const loadMore = useFeedStore((state) => state.loadMore)
  const selectFeed = useFeedStore((state) => state.selectFeed)
  const retry = useFeedStore((state) => state.retry)

  const facets = deriveTagFacets(loadedStories)
  const visibleStories = filterByTags(loadedStories, selectedTags)

  useEffect(() => {
    ensureLoaded()
  }, [ensureLoaded])

  return (
    <div>
      <div className={styles.tabs} role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={tab.key === feed}
            className={tab.key === feed ? styles.activeTab : styles.tab}
            onClick={() => selectFeed(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && loadedStories.length === 0 ? (
        <StatusMessage onRetry={() => retry()}>Couldn’t load stories.</StatusMessage>
      ) : (
        <>
          {loadedStories.length > 0 && <TagFilter facets={facets} />}
          {visibleStories.map((story) => <StoryCard key={story.id} story={story} />)}
          {loading && <StatusMessage>Loading…</StatusMessage>}
          {!loading && loadedStories.length > 0 && (
            <button type="button" className={styles.loadMore} onClick={() => loadMore()}>
              Load more
            </button>
          )}
          {!loading && !error && loadedStories.length === 0 && <StatusMessage>No stories here.</StatusMessage>}
        </>
      )}
    </div>
  )
}
