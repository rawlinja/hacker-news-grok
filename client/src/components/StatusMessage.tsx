import type { ReactNode } from 'react'
import styles from './StatusMessage.module.css'

export default function StatusMessage({ children, onRetry }: { children: ReactNode; onRetry?: () => void }) {
  return (
    <div className={styles.status}>
      <p>{children}</p>
      {onRetry && <button type="button" onClick={onRetry}>Retry</button>}
    </div>
  )
}
