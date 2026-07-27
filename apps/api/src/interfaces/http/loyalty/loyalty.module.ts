import { Module } from '@nestjs/common'
import { LoyaltyController } from './loyalty.controller'
import { PrismaLoyaltyCardRepository } from '@infrastructure/database/PrismaLoyaltyCardRepository'
import { GetLoyaltyCardUseCase } from '@application/loyalty/GetLoyaltyCardUseCase'

@Module({
  controllers: [LoyaltyController],
  providers: [
    PrismaLoyaltyCardRepository,
    {
      provide: GetLoyaltyCardUseCase,
      useFactory: (repo: PrismaLoyaltyCardRepository) => new GetLoyaltyCardUseCase(repo),
      inject: [PrismaLoyaltyCardRepository],
    },
  ],
  exports: [PrismaLoyaltyCardRepository],
})
export class LoyaltyModule {}
