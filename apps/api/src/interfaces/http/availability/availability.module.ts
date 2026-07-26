import { Module } from '@nestjs/common'
import { AvailabilityController } from './availability.controller'
import { AvailabilityCacheService } from '@infrastructure/cache/availability-cache.service'
import { PrismaServiceRepository } from '@infrastructure/database/PrismaServiceRepository'
import { PrismaProfessionalRepository } from '@infrastructure/database/PrismaProfessionalRepository'
import { PrismaWorkScheduleRepository } from '@infrastructure/database/PrismaWorkScheduleRepository'
import { PrismaAppointmentRepository } from '@infrastructure/database/PrismaAppointmentRepository'
import { PrismaManualBlockRepository } from '@infrastructure/database/PrismaManualBlockRepository'
import { CheckAvailabilityUseCase } from '@application/availability/CheckAvailabilityUseCase'
import { GetAvailableProfessionalsUseCase } from '@application/availability/GetAvailableProfessionalsUseCase'

@Module({
  controllers: [AvailabilityController],
  providers: [
    AvailabilityCacheService,
    PrismaServiceRepository,
    PrismaProfessionalRepository,
    PrismaWorkScheduleRepository,
    PrismaAppointmentRepository,
    PrismaManualBlockRepository,
    {
      provide: CheckAvailabilityUseCase,
      useFactory: (
        workSchedule: PrismaWorkScheduleRepository,
        appointment: PrismaAppointmentRepository,
        manualBlock: PrismaManualBlockRepository,
        service: PrismaServiceRepository,
      ) => new CheckAvailabilityUseCase(workSchedule, appointment, manualBlock, service),
      inject: [
        PrismaWorkScheduleRepository,
        PrismaAppointmentRepository,
        PrismaManualBlockRepository,
        PrismaServiceRepository,
      ],
    },
    {
      provide: GetAvailableProfessionalsUseCase,
      useFactory: (
        pro: PrismaProfessionalRepository,
        check: CheckAvailabilityUseCase,
      ) => new GetAvailableProfessionalsUseCase(pro, check),
      inject: [PrismaProfessionalRepository, CheckAvailabilityUseCase],
    },
  ],
  exports: [CheckAvailabilityUseCase, AvailabilityCacheService],
})
export class AvailabilityModule {}
