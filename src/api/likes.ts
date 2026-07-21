const VISITOR_STORAGE_KEY = 'mylastbite_like_visitor_id'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export interface LikeStatus {
  day: string
  liked: boolean
}

export interface DailyLikeCount {
  day: string
  count: number
}

interface LikeCountRow {
  day: string
  count: number | string
}

export class LikesUnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'LikesUnauthorizedError'
  }
}

function createVisitorId(): string {
  return crypto.randomUUID()
}

export function getLikeVisitorId(): string {
  const existing = window.localStorage.getItem(VISITOR_STORAGE_KEY)
  if (existing && UUID_PATTERN.test(existing)) return existing

  const visitorId = createVisitorId()
  window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId)
  return visitorId
}

export async function fetchLikeStatus(visitorId: string): Promise<LikeStatus> {
  const response = await fetch(`/api/likes?visitor_id=${encodeURIComponent(visitorId)}`, {
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`fetchLikeStatus failed: ${response.status}`)
  }
  return (await response.json()) as LikeStatus
}

export async function likeToday(visitorId: string): Promise<LikeStatus> {
  const response = await fetch('/api/likes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'like', visitor_id: visitorId }),
  })
  if (!response.ok) {
    throw new Error(`likeToday failed: ${response.status}`)
  }
  return (await response.json()) as LikeStatus
}

export async function fetchDailyLikeCounts(
  slug: string,
  days: number = 14,
): Promise<DailyLikeCount[]> {
  const response = await fetch('/api/likes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'counts', slug, days }),
  })

  if (response.status === 401) {
    throw new LikesUnauthorizedError()
  }
  if (!response.ok) {
    throw new Error(`fetchDailyLikeCounts failed: ${response.status}`)
  }

  const rows = (await response.json()) as LikeCountRow[]
  return rows.map((row) => ({ day: row.day, count: Number(row.count) }))
}
