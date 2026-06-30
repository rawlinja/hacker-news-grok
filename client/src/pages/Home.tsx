import { useCallback, useEffect, useState } from 'react'
import { getFeed } from '../api'
import type { Feed, Story } from '../types'
import StoryCard from '../components/StoryCard'
import StatusMessage from '../components/StatusMessage'
import styles from './Home.module.css'

const TABS: { key: Feed; label: string }[] = [
  { key: 'top', label: 'Top' },
  { key: 'new', label: 'New' },
  { key: 'best', label: 'Best' },
]

export default function Home() {
  const [feed, setFeed] = useState<Feed>('top')
  const [page, setPage] = useState(0)
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const load = useCallback(async (which: Feed, pageNum: number) => {
    setLoading(true)
    setError(false)
    try {
      const batch = await getFeed(which, pageNum)
      setStories((prev) => (pageNum === 0 ? batch : [...prev, ...batch]))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(feed, page)
  }, [feed, page, load])

  function selectFeed(next: Feed) {
    if (next === feed) return
    setStories([])
    setPage(0)
    setFeed(next)
  }

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

      {error && stories.length === 0 ? (
        <StatusMessage onRetry={() => load(feed, page)}>Couldn’t load stories.</StatusMessage>
      ) : (
        <>
          {stories.map((story) => <StoryCard key={story.id} story={story} />)}
          {loading && <StatusMessage>Loading…</StatusMessage>}
          {!loading && stories.length > 0 && (
            <button type="button" className={styles.loadMore} onClick={() => setPage((p) => p + 1)}>
              Load more
            </button>
          )}
          {!loading && !error && stories.length === 0 && <StatusMessage>No stories here.</StatusMessage>}
        </>
      )}
    </div>
  )
}
