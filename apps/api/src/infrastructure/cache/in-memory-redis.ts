interface Entry { value: string; expiresAt: number | null }

/**
 * Drop-in replacement for ioredis used when REDIS_URL is not configured.
 * Implements only the methods used by RedisLockService and AvailabilityCacheService.
 */
export class InMemoryRedis {
  private readonly store = new Map<string, Entry>()

  private isExpired(entry: Entry): boolean {
    return entry.expiresAt !== null && Date.now() > entry.expiresAt
  }

  async set(
    key: string,
    value: string,
    modeOrPx?: string,
    ttl?: number,
    flag?: string,
  ): Promise<'OK' | null> {
    if (flag === 'NX' && this.store.has(key)) {
      const existing = this.store.get(key)!
      if (!this.isExpired(existing)) return null
    }
    const expiresAt = modeOrPx === 'PX' && ttl ? Date.now() + ttl : null
    this.store.set(key, { value, expiresAt })
    return 'OK'
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    this.store.set(key, { value, expiresAt: Date.now() + seconds * 1000 })
    return 'OK'
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key)
    if (!entry) return null
    if (this.isExpired(entry)) { this.store.delete(key); return null }
    return entry.value
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0
    for (const k of keys) { if (this.store.delete(k)) count++ }
    return count
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$')
    const now = Date.now()
    return [...this.store.entries()]
      .filter(([k, e]) => regex.test(k) && (e.expiresAt === null || now <= e.expiresAt))
      .map(([k]) => k)
  }
}
