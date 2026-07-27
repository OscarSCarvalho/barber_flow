import { Module } from '@nestjs/common'
import { WaitlistController } from './waitlist.controller'
import { PrismaWaitlistRepository } from '@infrastructure/database/PrismaWaitlistRepository'
import { PrismaProfessionalRepository } from '@infrastructure/database/PrismaProfessionalRepository'
import { JoinWaitlistUseCase } from '@application/waitlist/JoinWaitlistUseCase'

@Module({
  controllers: [WaitlistController],
  providers: [
    PrismaWaitlistRepository,
    PrismaProfessionalRepository,
    {
      provide: JoinWaitlistUseCase,
      useFactory: (prof: PrismaProfessionalRepository, waitlist: PrismaWaitlistRepository) =>
        new JoinWaitlistUseCase(prof, waitlist),
      inject: [PrismaProfessionalRepository, PrismaWaitlistRepository],
    },
  ],
})
export class WaitlistModule {}
