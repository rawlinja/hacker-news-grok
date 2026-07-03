import { Link, Outlet } from 'react-router-dom'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          HN Grok
        </Link>
        <span className={styles.tagline}>browse · read · grok the discussion</span>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
