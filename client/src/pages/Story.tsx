import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStory } from '../api'
import type { StoryDetail } from '../types'
import { domainOf, hnDiscussUrl, relativeAge } from '../lib/format'
import Summary from '../components/Summary'
import CommentList from '../components/CommentList'
import StatusMessage from '../components/StatusMessage'
import styles from './Story.module.css'

export default function Story() {
  const { id } = useParams()
  const storyId = Number(id)
  const [detail, setDetail] = useState<StoryDetail | null>(null)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setError(false)
    setDetail(null)
    try {
      setDetail(await getStory(storyId))
    } catch {
      setError(true)
    }
  }, [storyId])

  useEffect(() => {
    load()
  }, [load])

  if (error) return <StatusMessage onRetry={load}>Couldn’t load this story.</StatusMessage>
  if (!detail) return <StatusMessage>Loading…</StatusMessage>

  const { story, comments } = detail
  const domain = domainOf(story.url)

  return (
    <div>
      <Link to="/" className={styles.back}>← Back</Link>
      <h1 className={styles.title}>{story.title}</h1>
      <div className={styles.meta}>
        <span>{story.score} points</span>
        <span>by {story.by}</span>
        <span>{relativeAge(story.time)}</span>
        <span>{story.descendants} comments</span>
      </div>

      <div className={styles.links}>
        {story.url && <a href={story.url} target="_blank" rel="noreferrer">Read article ↗{domain && ` (${domain})`}</a>}
        <a href={hnDiscussUrl(story.id)} target="_blank" rel="noreferrer">Discuss on HN ↗</a>
      </div>

      {!story.url && story.text && (
        <div className={styles.text} dangerouslySetInnerHTML={{ __html: story.text }} />
      )}

      <Summary storyId={story.id} />

      <h2 className={styles.commentsHeading}>Comments</h2>
      {comments.length > 0
        ? <CommentList comments={comments} />
        : <StatusMessage>No comments yet.</StatusMessage>}
    </div>
  )
}
