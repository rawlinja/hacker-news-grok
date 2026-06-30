const MINUTE = 60
const HOUR = 3600
const DAY = 86400

function plural(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? '' : 's'} ago`
}

export function relativeAge(epochSeconds: number, now = Math.floor(Date.now() / 1000)): string {
  const seconds = Math.max(0, now - epochSeconds)
  if (seconds < MINUTE) return 'just now'
  if (seconds < HOUR) return plural(Math.floor(seconds / MINUTE), 'minute')
  if (seconds < DAY) return plural(Math.floor(seconds / HOUR), 'hour')
  return plural(Math.floor(seconds / DAY), 'day')
}

export function domainOf(url?: string): string {
  if (!url) return ''
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function hnDiscussUrl(id: number): string {
  return `https://news.ycombinator.com/item?id=${id}`
}
