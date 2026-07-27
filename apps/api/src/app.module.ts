import { Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { PrismaModule } from './infrastructure/database/prisma.module'
import { RedisModule } from './infrastructure/cache/redis.module'
import { AuthModule } from './interfaces/http/auth/auth.module'
import { ServicesModule } from './interfaces/http/services/services.module'
import { ProfessionalsModule } from './interfaces/http/professionals/professionals.module'
import { AppointmentsModule } from './interfaces/http/appointments/appointments.module'
import { AvailabilityModule } from './interfaces/http/availability/availability.module'
import { ManualBlocksModule } from './interfaces/http/manual-blocks/manual-blocks.module'
import { ReviewsModule } from './interfaces/http/reviews/reviews.module'
import { LoyaltyModule } from './interfaces/http/loyalty/loyalty.module'
import { WaitlistModule } from './interfaces/http/waitlist/waitlist.module'
import { FinancialModule } from './interfaces/http/financial/financial.module'
import { RemindersModule } from './interfaces/http/reminders/reminders.module'
import { TenantGuard } from './interfaces/guards/tenant.guard'
import { LoggingInterceptor } from './interfaces/http/interceptors/logging.interceptor'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    AuthModule,
    ServicesModule,
    ProfessionalsModule,
    AppointmentsModule,
    AvailabilityModule,
    ManualBlocksModule,
    ReviewsModule,
    LoyaltyModule,
    WaitlistModule,
    FinancialModule,
    RemindersModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: TenantGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
