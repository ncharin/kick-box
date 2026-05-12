// Rate-limiter token-bucket : 10 requêtes/minute max (football-data.org free tier)
// On utilise 6500ms de délai minimum entre requêtes consécutives

const INTERVAL_MS = 6500 // 10 req/min → 1 req toutes les 6s, on prend de la marge

let lastCallTime = 0

export async function rateLimitedFetch(url: string, options: RequestInit): Promise<Response> {
  const now = Date.now()
  const elapsed = now - lastCallTime
  if (elapsed < INTERVAL_MS) {
    await sleep(INTERVAL_MS - elapsed)
  }
  lastCallTime = Date.now()
  return fetch(url, options)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
