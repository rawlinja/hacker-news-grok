import type { Comment } from '../types'
import { relativeAge } from '../lib/format'
import styles from './CommentList.module.css'

export default function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) return null
  return (
    <ul className={styles.list}>
      {comments.map((comment) => (
        <li key={comment.id} className={styles.comment}>
          <div className={styles.meta}>
            <span className={styles.author}>{comment.by}</span>
            <span>{relativeAge(comment.time)}</span>
          </div>
          <p className={styles.text}>{comment.text}</p>
          <CommentList comments={comment.replies} />
        </li>
      ))}
    </ul>
  )
}
