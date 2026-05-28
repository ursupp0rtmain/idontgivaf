let lastAttempt = 0

// Throttled to once per second; the button flees more often than we want to post.
export async function recordAttempt() {
  const now = Date.now()
  if (now - lastAttempt < 1000) return
  lastAttempt = now
  await fetch('/api/attempt', { method: 'POST' }).catch(() => {})
}

export async function recordClick() {
  await fetch('/api/click', { method: 'POST' }).catch(() => {})
}

export interface Stats {
  attempts: number
  clicks:   number
  visitors: number
  apiCalls: number
}

export async function fetchStats(): Promise<Stats> {
  const r = await fetch('/api/stats')
  return r.json()
}
