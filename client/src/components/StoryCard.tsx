import { Link } from 'react-router-dom'
import type { Story } from '../types'
import { domainOf, relativeAge } from '../lib/format'
import styles from './StoryCard.module.css'

export default function StoryCard({ story }: { story: Story }) {
  const domain = domainOf(story.url)
  const detailPath = `/story/${story.id}`

  return (
    <article className={styles.card}>
      <h2 className={styles.title}>
        {story.url ? (
          <a href={story.url} target="_blank" rel="noreferrer">{story.title}</a>
        ) : (
          <Link to={detailPath}>{story.title}</Link>
        )}
        {domain && <span className={styles.domain}>({domain})</span>}
      </h2>
      <div className={styles.meta}>
        <span>{story.score} points</span>
        <span>by {story.by}</span>
        <span>{relativeAge(story.time)}</span>
        <Link to={detailPath} className={styles.comments}>{story.descendants} comments</Link>
      </div>
    </article>
  )
}
