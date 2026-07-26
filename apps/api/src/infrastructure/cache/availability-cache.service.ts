import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_CLIENT } from './redis.constants'
import { TimeSlot } from '@domain/entities/TimeSlot'

const TTL_SECONDS = 60

@Injectable()
export class AvailabilityCacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private key(professionalId: string, date: string, serviceIds: string[]): string {
    const svcKey = [...serviceIds].sort().join(',')
    return `availability:prof:${professionalId}:date:${date}:svcs:${svcKey}`
  }

  async get(professionalId: string, date: string, serviceIds: string[]): Promise<TimeSlot[] | null> {
    const raw = await this.redis.get(this.key(professionalId, date, serviceIds))
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as Array<{ startsAt: string; endsAt: string; status: string; blockReason?: string }>
      return parsed.map((s) => ({
        startsAt: new Date(s.startsAt),
        endsAt: new Date(s.endsAt),
        status: s.status as TimeSlot['status'],
        blockReason: s.blockReason as TimeSlot['blockReason'],
      }))
    } catch {
      return null
    }
  }

  async set(professionalId: string, date: string, serviceIds: string[], slots: TimeSlot[]): Promise<void> {
    await this.redis.setex(this.key(professionalId, date, serviceIds), TTL_SECONDS, JSON.stringify(slots))
  }

  async invalidateForProfessional(professionalId: string, date: Date): Promise<void> {
    const dateStr = date.toISOString().split('T')[0]
    const pattern = `availability:prof:${professionalId}:date:${dateStr}:*`
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) await this.redis.del(...keys)
  }
}
