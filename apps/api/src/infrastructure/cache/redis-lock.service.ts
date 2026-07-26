import { Inject, Injectable } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_CLIENT } from './redis.constants'

@Injectable()
export class RedisLockService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async acquire(key: string, ttlMs: number): Promise<boolean> {
    const result = await this.redis.set(key, '1', 'PX', ttlMs, 'NX')
    return result === 'OK'
  }

  async release(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async invalidateAvailabilityCache(professionalId: string, date: Date): Promise<void> {
    const dateStr = date.toISOString().split('T')[0]
    await this.redis.del(`availability:prof:${professionalId}:date:${dateStr}`)
  }
}
