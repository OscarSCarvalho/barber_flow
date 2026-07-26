import { Module } from '@nestjs/common'
import { ManualBlocksController } from './manual-blocks.controller'
import { PrismaManualBlockRepository } from '@infrastructure/database/PrismaManualBlockRepository'
import { PrismaAppointmentRepository } from '@infrastructure/database/PrismaAppointmentRepository'
import { PrismaProfessionalRepository } from '@infrastructure/database/PrismaProfessionalRepository'
import { CreateManualBlockUseCase } from '@application/barber/CreateManualBlockUseCase'
import { DeleteManualBlockUseCase } from '@application/barber/DeleteManualBlockUseCase'
import { GetBarberDayScheduleUseCase } from '@application/barber/GetBarberDayScheduleUseCase'

@Module({
  controllers: [ManualBlocksController],
  providers: [
    PrismaManualBlockRepository,
    PrismaAppointmentRepository,
    PrismaProfessionalRepository,
    {
      provide: CreateManualBlockUseCase,
      useFactory: (prof: PrismaProfessionalRepository, appt: PrismaAppointmentRepository, block: PrismaManualBlockRepository) =>
        new CreateManualBlockUseCase(prof, appt, block),
      inject: [PrismaProfessionalRepository, PrismaAppointmentRepository, PrismaManualBlockRepository],
    },
    {
      provide: DeleteManualBlockUseCase,
      useFactory: (prof: PrismaProfessionalRepository, block: PrismaManualBlockRepository) =>
        new DeleteManualBlockUseCase(prof, block),
      inject: [PrismaProfessionalRepository, PrismaManualBlockRepository],
    },
    {
      provide: GetBarberDayScheduleUseCase,
      useFactory: (prof: PrismaProfessionalRepository, appt: PrismaAppointmentRepository, block: PrismaManualBlockRepository) =>
        new GetBarberDayScheduleUseCase(prof, appt, block),
      inject: [PrismaProfessionalRepository, PrismaAppointmentRepository, PrismaManualBlockRepository],
    },
  ],
})
export class ManualBlocksModule {}
