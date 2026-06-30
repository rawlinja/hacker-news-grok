import { useState } from 'react'
import { getSummary } from '../api'
import type { StorySummary } from '../types'
import styles from './Summary.module.css'

type State =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'done'; data: StorySummary }
  | { phase: 'error' }

export default function Summary({ storyId }: { storyId: number }) {
  const [state, setState] = useState<State>({ phase: 'idle' })

  async function generate() {
    setState({ phase: 'loading' })
    try {
      const data = await getSummary(storyId)
      setState({ phase: 'done', data })
    } catch {
      setState({ phase: 'error' })
    }
  }

  return (
    <section className={styles.panel}>
      <h2 className={styles.heading}>🤖 AI discussion summary</h2>

      {state.phase === 'idle' && (
        <button type="button" className={styles.action} onClick={generate}>Summarize discussion</button>
      )}
      {state.phase === 'loading' && <p className={styles.muted}>Summarizing the discussion…</p>}
      {state.phase === 'error' && (
        <div>
          <p className={styles.muted}>Couldn’t generate a summary.</p>
          <button type="button" className={styles.action} onClick={generate}>Try again</button>
        </div>
      )}
      {state.phase === 'done' && (
        <div>
          <p className={styles.summary}>{state.data.summary}</p>
          <div className={styles.footer}>
            <span className={styles.muted}>Based on {state.data.commentsUsed} comments</span>
            <button type="button" className={styles.regen} onClick={generate}>Regenerate</button>
          </div>
        </div>
      )}
    </section>
  )
}
