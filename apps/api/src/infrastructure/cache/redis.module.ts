import { Global, Module, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'
import { RedisLockService } from './redis-lock.service'
import { InMemoryRedis } from './in-memory-redis'
import { REDIS_CLIENT } from './redis.constants'

export { REDIS_CLIENT }

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL')
        if (!url) {
          new Logger('RedisModule').warn(
            'REDIS_URL não configurado — usando cache in-memory (apenas para desenvolvimento local)',
          )
          return new InMemoryRedis()
        }
        return new Redis(url)
      },
    },
    RedisLockService,
  ],
  exports: [REDIS_CLIENT, RedisLockService],
})
export class RedisModule {}
