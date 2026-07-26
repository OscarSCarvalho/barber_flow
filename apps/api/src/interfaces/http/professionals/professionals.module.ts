import { Module } from '@nestjs/common'
import { ProfessionalsController } from './professionals.controller'
import { PrismaUserRepository } from '@infrastructure/database/PrismaUserRepository'
import { PrismaProfessionalRepository } from '@infrastructure/database/PrismaProfessionalRepository'
import { PrismaWorkScheduleRepository } from '@infrastructure/database/PrismaWorkScheduleRepository'
import { CreateProfessionalUseCase } from '@application/professionals/CreateProfessionalUseCase'
import { UpdateProfessionalUseCase } from '@application/professionals/UpdateProfessionalUseCase'
import { SetWorkScheduleUseCase } from '@application/professionals/SetWorkScheduleUseCase'

@Module({
  controllers: [ProfessionalsController],
  providers: [
    PrismaUserRepository,
    PrismaProfessionalRepository,
    PrismaWorkScheduleRepository,
    {
      provide: CreateProfessionalUseCase,
      useFactory: (u: PrismaUserRepository, p: PrismaProfessionalRepository) =>
        new CreateProfessionalUseCase(u, p),
      inject: [PrismaUserRepository, PrismaProfessionalRepository],
    },
    {
      provide: UpdateProfessionalUseCase,
      useFactory: (p: PrismaProfessionalRepository) => new UpdateProfessionalUseCase(p),
      inject: [PrismaProfessionalRepository],
    },
    {
      provide: SetWorkScheduleUseCase,
      useFactory: (p: PrismaProfessionalRepository, w: PrismaWorkScheduleRepository) =>
        new SetWorkScheduleUseCase(p, w),
      inject: [PrismaProfessionalRepository, PrismaWorkScheduleRepository],
    },
  ],
  exports: [PrismaProfessionalRepository, PrismaWorkScheduleRepository],
})
export class ProfessionalsModule {}
